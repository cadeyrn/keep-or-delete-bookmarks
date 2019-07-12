'use strict';

const WHITELIST_PAGE = 'options.html';

const elBody = document.querySelector('body');
const elBookmarkCard = document.getElementById('bookmark-card');
const elBookmarkId = document.getElementById('bookmark-id');
const elBookmarkPath = document.getElementById('bookmark-path');
const elBookmarkUrl = document.getElementById('bookmark-url');
const elBookmarkTitle = document.getElementById('bookmark-title');
const elButtonWrapper = document.getElementById('button-wrapper');
const elEmptyState = document.getElementById('empty-state');

/**
 * @exports ui
 */
const ui = {
  /**
   * Fired when the initial HTML document has been completely loaded and parsed. Starts the collecting process.
   *
   * @returns {void}
   */
  init () {
    browser.runtime.sendMessage({ message : 'collect' });
  },

  /**
   * Fired when a message is sent from the background script to the UI script.
   *
   * @param {Object} response - contains the response from the background script
   *
   * @returns {void}
   */
  handleResponse (response) {
    if (response.message === 'random-bookmark') {
      if (response.bookmark) {
        const pattern = new RegExp(/^https?:\/\//, 'gi');

        elBookmarkCard.removeAttribute('hidden');
        elButtonWrapper.removeAttribute('hidden');
        elEmptyState.setAttribute('hidden', true);
        elBookmarkId.textContent = response.bookmark.id;
        elBookmarkTitle.textContent = response.bookmark.title;
        elBookmarkPath.textContent = response.bookmark.path.join(' / ');

        if (elBookmarkUrl.firstChild) {
          elBookmarkUrl.removeChild(elBookmarkUrl.firstChild);
        }

        if (pattern.test(response.bookmark.url)) {
          const elUrl = document.createElement('a');
          elUrl.setAttribute('href', response.bookmark.url);
          elUrl.setAttribute('target', '_blank');
          elUrl.setAttribute('rel', 'noopener');
          elUrl.textContent = response.bookmark.url;
          elBookmarkUrl.appendChild(elUrl);
        }
        else {
          elBookmarkUrl.textContent = response.bookmark.url;
        }
      }
      else {
        elBookmarkCard.setAttribute('hidden', true);
        elButtonWrapper.setAttribute('hidden', true);
        elEmptyState.removeAttribute('hidden');
      }
    }
    else if (response.message === 'disable-skip-button') {
      elButtonWrapper.querySelector('[data-action="skip-bookmark"]').setAttribute('disabled', true);
    }
  },

  /**
   * Fired when one of the buttons is clicked.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  handleButtonClicks (e) {
    if (e.target.getAttribute('data-action')) {
      e.preventDefault();

      switch (e.target.getAttribute('data-action')) {
        case 'delete-bookmark':
          ui.deleteBookmark(elBookmarkId.textContent);
          break;
        case 'keep-bookmark':
          ui.keepBookmark(elBookmarkId.textContent);
          break;
        case 'skip-bookmark':
          ui.skipBookmark(elBookmarkId.textContent);
          break;
        case 'open-options':
          ui.openWhitelist();
          break;
        default:
        // do nothing
      }
    }
  },

  /**
   * This method is used to delete a bookmark.
   *
   * @param {string} id - the id of the bookmark
   *
   * @returns {void}
   */
  deleteBookmark (id) {
    browser.runtime.sendMessage({
      message : 'delete',
      id : id
    });
  },

  /**
   * This method is used to keep a bookmark.
   *
   * @param {string} id - the id of the bookmark
   *
   * @returns {void}
   */
  keepBookmark (id) {
    browser.runtime.sendMessage({
      message : 'keep',
      id : id
    });
  },

  /**
   * This method is used to skip a bookmark.
   *
   * @param {string} id - the id of the bookmark
   *
   * @returns {void}
   */
  skipBookmark (id) {
    browser.runtime.sendMessage({
      message : 'skip',
      id : id
    });
  },

  /**
   * This method is used to open the options.
   *
   * @returns {void}
   */
  openWhitelist () {
    browser.tabs.update({ url : WHITELIST_PAGE });
  }
};

document.addEventListener('DOMContentLoaded', ui.init);
elBody.addEventListener('click', ui.handleButtonClicks);

browser.runtime.onMessage.addListener(ui.handleResponse);
