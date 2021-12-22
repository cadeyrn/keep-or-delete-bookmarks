'use strict';

const UI_PAGE = 'html/ui.html';

/**
 * @exports kodb
 */
const kodb = {
  /**
   * Timeout for reaching a server in milliseconds. It's always 15 seconds, there is no user setting.
   *
   * @type {int}
   */
  CHECK_TIMEOUT_IN_MS : 15000,

  /**
   * Whether the internal skip list should be used or not. It's always true, there is no user setting.
   *
   * @type {boolean}
   */
  CHECK_USE_SKIP_LIST : true,

  /**
   * An array of URL patterns which should be ignored while checking for broken bookmarks. Please only add patterns
   * if there are known problems and add a comment with the corresponding GitHub issue.
   *
   * @type {Array.<string>}
   *
   */
  CHECK_SKIP_LIST : [
    /* eslint-disable no-useless-escape, line-comment-position, no-inline-comments */
    '^https?:\/\/groups.google.com/group/', // issue #9
    '^https?:\/\/accounts-static.cdn.mozilla.net', // issue #9
    '^https?:\/\/accounts.firefox.com', // issue #9
    '^https?:\/\/addons.cdn.mozilla.net', // issue #9
    '^https?:\/\/addons.mozilla.org', // issue #9
    '^https?:\/\/api.accounts.firefox.com', // issue #9
    '^https?:\/\/content.cdn.mozilla.net', // issue #9
    '^https?:\/\/discovery.addons.mozilla.org', // issue #9
    '^https?:\/\/install.mozilla.org', // issue #9
    '^https?:\/\/oauth.accounts.firefox.com', // issue #9
    '^https?:\/\/profile.accounts.firefox.com', // issue #9
    '^https?:\/\/support.mozilla.org', // issue #9
    '^https?:\/\/sync.services.mozilla.com', // issue #9
    '^https?:\/\/testpilot.firefox.com' // issue #9
    /* eslint-enable no-useless-escape, line-comment-position, no-inline-comments */
  ],

  /**
   * Status code for a server response we are waiting for.
   *
   * @type {string}
   */
  CHECK_STATUS_AWAIT : 'await',

  /**
   * Status code for a broken bookmark.
   *
   * @type {string}
   */
  CHECK_STATUS_FAILURE : 'failure',

  /**
   * Status code if a bookmark can not be checked.
   *
   * @type {string}
   */
  CHECK_STATUS_SKIP : 'skip',

  /**
   * Status code for a working bookmark.
   *
   * @type {string}
   */
  CHECK_STATUS_SUCCESS : 'success',

  /**
   * An object containing the IDs and paths of all bookmarks on the whitelist.
   *
   * @type {Object}
   */
  whitelist : {},

  /**
   * An array containing all the user's bookmarks.
   *
   * @type {Array.<bookmarks.BookmarkTreeNode>}
   */
  collectedBookmarks : [],

  /**
   * Additional data stored for bookmarks. In current version it only contains the full bookmark path.
   *
   * @type {Array.<Object>}
   */
  additionalData : [],

  /**
   * Stack of bookmark IDs, gets populated when a new bookmark is displayed. Used for showing previous bookmark.
   *
   * @type {Array.<string>}
   */
  historyStack : [],

  /**
   * Fired when a bookmark is deleted.
   *
   * @param {int} id - id of the bookmark that was deleted
   *
   * @returns {void}
   */
  async onBookmarkRemoved (id) {
    // remove bookmark from the whitelist
    const { whitelist } = await browser.storage.local.get({ whitelist : {} });
    delete whitelist[id];
    browser.storage.local.set({ whitelist : whitelist });
  },

  /**
   * Fired when the toolbar icon is clicked. This method is used to open the user interface in a new tab or to switch
   * to the tab with the user interface if the user interface is already opened.
   *
   * @returns {void}
   */
  openUserInterface () {
    const url = browser.runtime.getURL(UI_PAGE);

    browser.tabs.query({}, (tabs) => {
      let tabId = null;

      for (const tab of tabs) {
        if (tab.url === url) {
          tabId = tab.id;
          break;
        }
      }

      if (tabId) {
        browser.tabs.update(tabId, { active : true });
      }
      else {
        browser.tabs.create({ url });
      }
    });
  },

  /**
   * Fired when a message is sent from the UI script to the background script.
   *
   * @param {Object} response - contains the response from the UI script
   *
   * @returns {void}
   */
  async handleResponse (response) {
    if (response.message === 'collect') {
      const { whitelist, confirmations } = await browser.storage.local.get({ whitelist : {}, confirmations : true });
      kodb.whitelist = whitelist;

      browser.runtime.sendMessage({ message : 'confirmations', confirmations : confirmations });

      await kodb.collectAllBookmarks();
      kodb.showNextBookmark(null);

      browser.runtime.sendMessage({ message : 'disable-previous-button' });
    }
    else if (response.message === 'delete') {
      browser.bookmarks.remove(response.id);

      kodb.removeFromCollectedBookmarks(response.id);
      kodb.showNextBookmark(response.id);
    }
    else if (response.message === 'keep') {
      kodb.addToWhitelist(response.id, response.title, response.url, response.path);
      kodb.removeFromCollectedBookmarks(response.id);
      kodb.showNextBookmark(response.id);
    }
    else if (response.message === 'previous') {
      kodb.showPreviousBookmark();
    }
    else if (response.message === 'skip') {
      kodb.showNextBookmark(response.id);
    }
  },

  /**
   * Calculates the full path of bookmarks.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {Array.<string>} path - an array with parts of the bookmark path
   *
   * @returns {Array.<Object>} - an array with the full path of all bookmarks
   */
  calculateBookmarkPaths (bookmark, path) {
    if (bookmark.title) {
      path.push(bookmark.title);
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        kodb.calculateBookmarkPaths(child, path);
      }
    }
    else {
      if (!kodb.additionalData[bookmark.id]) {
        kodb.additionalData[bookmark.id] = {};
      }

      kodb.additionalData[bookmark.id].path = path.slice(0, -1);
    }

    path.pop();

    return kodb.additionalData;
  },

  /**
   * This method is used to start collecting all bookmarks.
   *
   * @returns {Promise} - resolves after completion
   */
  async collectAllBookmarks () {
    const bookmarks = await browser.bookmarks.getTree();

    return new Promise((resolve) => {
      kodb.collectedBookmarks = [];
      kodb.calculateBookmarkPaths(bookmarks[0], []);
      kodb.collectBookmark(bookmarks[0]);

      resolve();
    });
  },

  /**
   * This recursive method pushes a single bookmark to a global array of bookmarks and calls itself for each child.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   *
   * @returns {void}
   */
  collectBookmark (bookmark) {
    // we only collect bookmarks, no folders or separators
    if (bookmark.type === 'bookmark' && !kodb.whitelist[bookmark.id]) {
      const { id, title, url, dateAdded } = bookmark;
      const { path } = kodb.additionalData[id];

      kodb.collectedBookmarks.push({ id, title, url, dateAdded, path });
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        kodb.collectBookmark(child);
      }
    }
  },

  /**
   * This method finds the index of a bookmark in the array of collected bookmarks.
   *
   * @param {string} id - the ID of the bookmark
   *
   * @returns {int} - the index in the array
   */
  getIndexById (id) {
    return kodb.collectedBookmarks.findIndex((bookmark) => bookmark.id === id);
  },

  /**
   * This method is used to load the previously shown bookmark.
   *
   * @returns {void}
   */
  showPreviousBookmark () {
    const previousBookmarkId = kodb.historyStack.pop();

    if (previousBookmarkId) {
      const previousBookmark = kodb.collectedBookmarks[kodb.getIndexById(previousBookmarkId)];
      browser.runtime.sendMessage({ message : 'show-bookmark', bookmark : previousBookmark });
      kodb.checkForBrokenBookmark(previousBookmark);
    }

    if (kodb.historyStack.length === 0) {
      browser.runtime.sendMessage({ message : 'disable-previous-button' });
    }
  },

  /**
   * This method changes the bookmark that will be displayed next and makes sure that the same bookmark is never
   * displayed twice in a row.
   *
   * @param {string|null} id - the ID of the bookmark
   *
   * @returns {void}
   */
  showNextBookmark (id) {
    const { length } = kodb.collectedBookmarks;
    let nextBookmarkId = id;
    let nextBookmark = null;

    if (length > 1) {
      if (id) {
        kodb.historyStack.push(id);
      }

      while (id === nextBookmarkId) {
        const idx = Math.floor(Math.random() * length);
        nextBookmark = kodb.collectedBookmarks[idx];

        if (nextBookmark) {
          nextBookmarkId = nextBookmark.id;
        }
      }
    }
    else {
      nextBookmark = kodb.collectedBookmarks[0];
      browser.runtime.sendMessage({ message : 'disable-skip-button' });
    }

    browser.runtime.sendMessage({ message : 'show-bookmark', bookmark : nextBookmark });

    kodb.checkForBrokenBookmark(nextBookmark);
  },

  /**
   * This method removes a bookmark from the collected bookmarks array.
   *
   * @param {string} id - the ID of the bookmark
   *
   * @returns {void}
   */
  removeFromCollectedBookmarks (id) {
    kodb.collectedBookmarks.splice(kodb.getIndexById(id), 1);
    delete kodb.additionalData[id];
  },

  /**
   * Adds a bookmark to the whitelist.
   *
   * @param {string} id - the id of the bookmark
   * @param {string} title - the title of the bookmark
   * @param {string} url - the URL of the bookmark
   * @param {string} path - the path of the bookmark
   *
   * @returns {void}
   */
  async addToWhitelist (id, title, url, path) {
    const { whitelist } = await browser.storage.local.get({ whitelist : {} });

    if (!whitelist[id]) {
      whitelist[id] = { title : title, url : url, path : path };
      browser.storage.local.set({ whitelist : whitelist });
    }
  },

  /**
   * This method is used to check for a broken bookmark.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - the bookmark object
   *
   * @returns {void}
   */
  async checkForBrokenBookmark (bookmark) {
    browser.runtime.sendMessage({ message : 'update-bookmark-status', status : kodb.CHECK_STATUS_AWAIT });

    if (kodb.CHECK_USE_SKIP_LIST && kodb.CHECK_SKIP_LIST.some((i) => new RegExp('\\b' + i + '\\b').test(bookmark.url))) {
      browser.runtime.sendMessage({ message : 'update-bookmark-status', status : kodb.CHECK_STATUS_SKIP });

      return;
    }

    let status = kodb.CHECK_STATUS_SKIP;

    if ((/^https?:\/\//).test(bookmark.url)) {
      status = await kodb.checkHttpResponse(bookmark, 'HEAD');
    }

    browser.runtime.sendMessage({ message : 'update-bookmark-status', status : status });
  },

  /**
   * This method sends a fetch request to check if a bookmark is broken or not.
   *
   * @param {bookmarks.BookmarkTreeNode} bookmark - a single bookmark
   * @param {string} method - the HTTP method to use (HEAD for first attempt, GET for second attempt)
   *
   * @returns {Promise<string>} - status of the bookmark
   */
  async checkHttpResponse (bookmark, method) {
    try {
      const controller = new AbortController();
      const { signal } = controller;

      setTimeout(() => controller.abort(), kodb.CHECK_TIMEOUT_IN_MS);

      const response = await fetch(bookmark.url, {
        cache : 'no-store',
        method : method,
        mode : 'no-cors',
        signal : signal
      });

      if (method === 'HEAD') {
        if (!response.redirected) {
          const { headers } = response;

          if (headers.has('Content-Length') && headers.get('Content-Length') === '0') {
            return kodb.checkHttpResponse(bookmark, 'GET');
          }
        }

        if (!response.ok) {
          return kodb.checkHttpResponse(bookmark, 'GET');
        }
      }

      return response.ok ? kodb.CHECK_STATUS_SUCCESS : kodb.CHECK_STATUS_FAILURE;
    }
    catch (error) {
      if (method === 'HEAD') {
        return kodb.checkHttpResponse(bookmark, 'GET');
      }

      return kodb.CHECK_STATUS_FAILURE;
    }
  }
};

browser.bookmarks.onRemoved.addListener(kodb.onBookmarkRemoved);
browser.browserAction.onClicked.addListener(kodb.openUserInterface);
browser.runtime.onMessage.addListener(kodb.handleResponse);

browser.menus.create({
  title : browser.i18n.getMessage('extension_name'),
  contexts : ['tools_menu'],
  command : '_execute_browser_action'
});
