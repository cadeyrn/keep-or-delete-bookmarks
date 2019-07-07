'use strict';

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
  }
};

document.addEventListener('DOMContentLoaded', ui.init);
