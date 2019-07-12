'use strict';

const UI_PAGE = 'html/ui.html';

/**
 * @exports kodb
 */
const kodb = {
  /**
   * An array containing the IDs of all bookmarks on the whitelist.
   *
   * @type {Array.<string>}
   */
  whitelist : [],

  /**
   * An array containing all the user's bookmarks.
   *
   * @type {Array.<bookmarks.BookmarkTreeNode>}
   */
  collectedBookmarks : [],

  /**
   * Additional data stored for bookmarks. In current version it only contains the full bookmark path.
   *
   * @type {Array.<string>}
   */
  additionalData : [],

  /**
   * Fired when a bookmark is deleted.
   *
   * @param {int} id - id of the bookmark that was deleted
   *
   * @returns {void}
   */
  async onBookmarkRemoved (id) {
    // remove bookmark from the whitelist
    const { whitelist } = await browser.storage.local.get({ whitelist : [] });
    whitelist.splice(whitelist.indexOf(id), 1);
    browser.storage.local.set({ whitelist : whitelist });
  },

  /**
   * Fired when the toolbar icon is clicked. This method is used to open the user interface in a new tab or to switch
   * to the tab with the user interface if the user interface is already opened.
   *
   * @returns {void}
   */
  openUserInterface () {
    const url = browser.extension.getURL(UI_PAGE);

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
      const { whitelist } = await browser.storage.local.get({ whitelist : [] });
      kodb.whitelist = whitelist;

      await kodb.collectAllBookmarks();
      kodb.showNextBookmark();
    }
    else if (response.message === 'delete') {
      browser.bookmarks.remove(response.id);

      kodb.removeFromCollectedBookmarks(response.id);
      kodb.showNextBookmark(response.id);
    }
    else if (response.message === 'keep') {
      kodb.addToWhitelist(response.id);
      kodb.removeFromCollectedBookmarks(response.id);
      kodb.showNextBookmark(response.id);
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
   * @returns {Array.<string>} - an array with the full path of all bookmarks
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
    // we only collect bookmarks, no folders or seperators
    if (bookmark.type === 'bookmark' && !kodb.whitelist.includes(bookmark.id)) {
      const { id, title, url } = bookmark;
      const { path } = kodb.additionalData[id];

      kodb.collectedBookmarks.push({ id, title, url, path });
    }

    if (bookmark.children) {
      for (const child of bookmark.children) {
        kodb.collectBookmark(child);
      }
    }
  },

  /**
   * This method finds a bookmark by the ID.
   *
   * @param {string} id - the ID of the bookmark
   *
   * @returns {bookmarks.BookmarkTreeNode} - a single bookmark
   */
  findById (id) {
    return kodb.collectedBookmarks.filter((bookmark) => bookmark.id === id)[0];
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
   * This method changes the bookmark that will be displayed next and makes sure that the same bookmark is never
   * displayed twice in a row.
   *
   * @param {string} id - the ID of the bookmark
   *
   * @returns {void}
   */
  showNextBookmark (id) {
    const { length } = kodb.collectedBookmarks;
    let nextBookmarkId = id;
    let nextBookmark = null;

    if (length > 1) {
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

    browser.runtime.sendMessage({ message : 'random-bookmark', bookmark : nextBookmark });
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
   * @param {integer} id - the id of the bookmark
   *
   * @returns {void}
   */
  async addToWhitelist (id) {
    const { whitelist } = await browser.storage.local.get({ whitelist : [] });

    if (!whitelist.includes(id)) {
      whitelist.push(id);
      browser.storage.local.set({ whitelist : whitelist });
    }
  }
};

browser.bookmarks.onRemoved.addListener(kodb.onBookmarkRemoved);
browser.browserAction.onClicked.addListener(kodb.openUserInterface);
browser.runtime.onMessage.addListener(kodb.handleResponse);
