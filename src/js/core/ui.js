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
const elEnableConfirmations = document.getElementById('enable-confirmations');
const elOpenBookmarkBtn = document.querySelector('button[data-action="open-bookmark"]');

/**
 * @exports ui
 */
const ui = {
  /**
   * Whether or not confirmation dialogs are enabled or not. Default: true.
   *
   * @type {boolean}
   */
  confirmations : true,

  /**
   * Fired when the initial HTML document has been completely loaded and parsed. Starts the collecting process.
   *
   * @returns {void}
   */
  init () {
    browser.runtime.sendMessage({ message : 'collect' });
  },

  /**
   * Confirmation dialog implementation.
   *
   * @param {string} title - the title of the bookmark
   *
   * @returns {Promise} - resolves on success (OK button)
   */
  confirm (title) {
    const elModal = document.getElementById('confirm-dialog');
    elModal.classList.add('visible');

    const elTitle = document.getElementById('confirm-title');
    elTitle.textContent = title;

    const elSubmitButton = elModal.querySelector('#button-confirm-ok');
    const elCloseButton = elModal.querySelector('#button-confirm-cancel');

    const hideModal = () => {
      elModal.classList.remove('visible');
    };

    return new Promise((resolve) => {
      window.onkeydown = function (e) {
        if (e.key === 'Escape') {
          hideModal();
        }
      };

      window.onclick = function (e) {
        if (e.target === elModal) {
          hideModal();
        }
      };

      elCloseButton.onclick = () => {
        hideModal();
      };

      elSubmitButton.onclick = () => {
        hideModal();
        resolve();
      };
    });
  },

  /**
   * Fired when a message is sent from the background script to the UI script.
   *
   * @param {Object} response - contains the response from the background script
   *
   * @returns {void}
   */
  handleResponse (response) {
    if (response.message === 'confirmations') {
      ui.confirmations = response.confirmations;

      if (response.confirmations) {
        elEnableConfirmations.setAttribute('checked', 'true');
      }
      else {
        elEnableConfirmations.removeAttribute('checked');
      }
    }
    else if (response.message === 'random-bookmark') {
      if (response.bookmark) {
        const pattern = new RegExp(/^https?:\/\//, 'gi');

        elBookmarkCard.removeAttribute('hidden');
        elButtonWrapper.removeAttribute('hidden');
        elEmptyState.setAttribute('hidden', 'true');
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
          elOpenBookmarkBtn.removeAttribute('disabled');
        }
        else {
          elBookmarkUrl.textContent = response.bookmark.url;
          elOpenBookmarkBtn.setAttribute('disabled', 'true');
        }
      }
      else {
        elBookmarkCard.setAttribute('hidden', 'true');
        elButtonWrapper.setAttribute('hidden', 'true');
        elEmptyState.removeAttribute('hidden');
      }
    }
    else if (response.message === 'disable-skip-button') {
      elButtonWrapper.querySelector('[data-action="skip-bookmark"]').setAttribute('disabled', 'true');
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
          ui.deleteBookmark(elBookmarkId.textContent, elBookmarkTitle.textContent);
          break;
        case 'keep-bookmark':
          ui.keepBookmark(
            elBookmarkId.textContent, elBookmarkTitle.textContent, elBookmarkUrl.textContent, elBookmarkPath.textContent
          );
          break;
        case 'open-bookmark':
          window.open(elBookmarkUrl.textContent, '_blank');
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
   * @param {string} title - the title of the bookmark
   *
   * @returns {void}
   */
  async deleteBookmark (id, title) {
    if (ui.confirmations) {
      await ui.confirm(title);
    }

    browser.runtime.sendMessage({
      message : 'delete',
      id : id
    });
  },

  /**
   * This method is used to keep a bookmark.
   *
   * @param {string} id - the id of the bookmark
   * @param {string} title - the title of the bookmark
   * @param {string} url - the URL of the bookmark
   * @param {string} path - the path of the bookmark
   *
   * @returns {void}
   */
  keepBookmark (id, title, url, path) {
    browser.runtime.sendMessage({
      message : 'keep',
      id : id,
      title : title,
      url : url,
      path : path
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

elEnableConfirmations.addEventListener('change', (e) => {
  ui.confirmations = e.target.checked;
  browser.storage.local.set({ confirmations : e.target.checked });
});

browser.runtime.onMessage.addListener(ui.handleResponse);
