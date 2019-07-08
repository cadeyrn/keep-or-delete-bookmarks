'use strict';

const elBookmarkPath = document.getElementById('bookmark-path');
const elBookmarkUrl = document.getElementById('bookmark-url');
const elBookmarkTitle = document.getElementById('bookmark-title');

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
      const pattern = new RegExp(/^https?:\/\//, 'gi');

      elBookmarkTitle.textContent = response.bookmark.title;
      elBookmarkPath.textContent = response.bookmark.path.join(' / ');

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
  }
};

document.addEventListener('DOMContentLoaded', ui.init);

browser.runtime.onMessage.addListener(ui.handleResponse);
