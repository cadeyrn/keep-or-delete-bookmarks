'use strict';

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

        if (pattern.test(encodeURI(response.bookmark.url))) {
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
  },

  /**
   * Fired when one of the buttons is clicked.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  handleActionButtonClicks (e) {
    if (e.target.getAttribute('data-action')) {
      e.preventDefault();

      switch (e.target.getAttribute('data-action')) {
        case 'delete':
          ui.deleteBookmark(elBookmarkId.textContent);
          break;
        default:
        // do nothing
      }
    }
  },

  /**
   * This method is used to delete a bookmark.
   *
   * @param {string} bookmarkId - the id of the bookmark
   *
   * @returns {void}
   */
  deleteBookmark (bookmarkId) {
    browser.runtime.sendMessage({
      message : 'delete',
      bookmarkId : bookmarkId
    });
  }
};

document.addEventListener('DOMContentLoaded', ui.init);
elBody.addEventListener('click', ui.handleActionButtonClicks);

browser.runtime.onMessage.addListener(ui.handleResponse);
