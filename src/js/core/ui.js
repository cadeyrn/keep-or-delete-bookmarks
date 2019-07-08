'use strict';

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
      elBookmarkTitle.textContent = response.bookmark.title;
    }
  }
};

document.addEventListener('DOMContentLoaded', ui.init);

browser.runtime.onMessage.addListener(ui.handleResponse);
