'use strict';

const WHITELIST_PAGE = 'options.html';

const elBody = document.querySelector('body');
const elBookmarkCard = document.getElementById('bookmark-card');
const elBookmarkDateAdded = document.getElementById('bookmark-date-added');
const elBookmarkId = document.getElementById('bookmark-id');
const elBookmarkPath = document.getElementById('bookmark-path');
const elBookmarkUrl = document.getElementById('bookmark-url');
const elBookmarkTitle = document.getElementById('bookmark-title');
const elButtonWrapper = document.getElementById('button-wrapper');
const elConfirmDialog = document.getElementById('confirm-dialog');
const elEmptyState = document.getElementById('empty-state');
const elEnableConfirmations = document.getElementById('enable-confirmations');
const elOpenBookmarkBtn = document.querySelector('button[data-action="open-bookmark"]');
const elPreviousBookmarkBtn = document.querySelector('button[data-action="previous-bookmark"]');
const elStatus = document.getElementById('bookmark-status');
const elStatusIndicator = elStatus.querySelector('.indicator');
const elStatusText = elStatus.querySelector('.text');

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
    ui.setupPermissionGrantHandler();
  },

  /**
   * Set up the listener for the link to grant the permission for the broken bookmark check.
   *
   * @returns {void}
   */
  setupPermissionGrantHandler () {
    elStatusText.onclick = async () => {
      if (elStatusText.classList.contains('permission-needed')) {
        const granted = await browser.permissions.request({
          origins : ['<all_urls>']
        });

        if (granted) {
          browser.runtime.sendMessage({
            message : 'recheck-bookmark',
            id : elBookmarkId.textContent
          });
        }
      }
    };
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
        e.preventDefault();

        if (e.key === 'Escape') {
          hideModal();
        }
        else if (e.key === 'Enter') {
          hideModal();
          resolve();
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
    if (response.message === 'permission-change') {
      browser.runtime.sendMessage({
        message : 'recheck-bookmark',
        id : elBookmarkId.textContent
      });
    }
    else if (response.message === 'confirmations') {
      ui.confirmations = response.confirmations;

      if (response.confirmations) {
        elEnableConfirmations.setAttribute('checked', 'true');
      }
      else {
        elEnableConfirmations.removeAttribute('checked');
      }
    }
    else if (response.message === 'show-bookmark') {
      if (response.bookmark) {
        const pattern = new RegExp(/^https?:\/\//, 'gi');
        const dateAdded = new Intl.DateTimeFormat('default', {
          day : '2-digit', month : '2-digit', year : 'numeric'
        }).format(new Date(response.bookmark.dateAdded));

        elBookmarkCard.removeAttribute('hidden');
        elButtonWrapper.removeAttribute('hidden');
        elEmptyState.setAttribute('hidden', 'true');
        elBookmarkId.textContent = response.bookmark.id;
        elBookmarkTitle.textContent = response.bookmark.title;
        elBookmarkPath.textContent = response.bookmark.path.join(' / ');
        elBookmarkDateAdded.textContent = browser.i18n.getMessage('date_added') + ': ' + dateAdded;

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

        elPreviousBookmarkBtn.removeAttribute('disabled');
      }
      else {
        elBookmarkCard.setAttribute('hidden', 'true');
        elButtonWrapper.setAttribute('hidden', 'true');
        elEmptyState.removeAttribute('hidden');
      }
    }
    else if (response.message === 'disable-previous-button') {
      elPreviousBookmarkBtn.setAttribute('disabled', 'true');
    }
    else if (response.message === 'disable-skip-button') {
      elButtonWrapper.querySelector('[data-action="skip-bookmark"]').setAttribute('disabled', 'true');
    }
    else if (response.message === 'update-bookmark-status') {
      if (response.status === 'permission-needed') {
        elStatusIndicator.classList.add('failure');
        elStatusIndicator.classList.remove('success');
        elStatusText.classList.add('permission-needed');
        elStatusText.textContent = browser.i18n.getMessage('check_status_permission_needed');
      }
      else if (response.status === 'success') {
        elStatusIndicator.classList.add('success');
        elStatusIndicator.classList.remove('failure');
        elStatusText.classList.remove('permission-needed');
        elStatusText.textContent = browser.i18n.getMessage('check_status_success');
      }
      else if (response.status === 'failure') {
        elStatusIndicator.classList.add('failure');
        elStatusIndicator.classList.remove('success');
        elStatusText.classList.remove('permission-needed');
        elStatusText.textContent = browser.i18n.getMessage('check_status_failure');
      }
      else if (response.status === 'skip') {
        elStatusIndicator.classList.remove('success', 'failure');
        elStatusText.classList.remove('permission-needed');
        elStatusText.textContent = browser.i18n.getMessage('check_status_skipped');
      }
      else {
        elStatusIndicator.classList.remove('success', 'failure');
        elStatusText.classList.remove('permission-needed');
        elStatusText.textContent = '…';
      }
    }
  },

  /**
   * Fired when a key is pressed.
   *
   * @param {KeyboardEvent} e - event
   *
   * @returns {void}
   */
  handleKeyPress (e) {
    if (elConfirmDialog.classList.contains('visible')) {
      return;
    }

    if (e.key === 'Backspace') {
      ui.deleteBookmark(elBookmarkId.textContent, elBookmarkTitle.textContent);
    }
    else if (e.key === ' ') {
      ui.keepBookmark(
        elBookmarkId.textContent, elBookmarkTitle.textContent, elBookmarkUrl.textContent, elBookmarkPath.textContent
      );
    }
    else if (e.key === 'Enter') {
      window.open(elBookmarkUrl.textContent, '_blank');
    }
    else if (e.key === 'ArrowLeft') {
      ui.previousBookmark();
    }
    else if (e.key === 'ArrowRight') {
      ui.skipBookmark(elBookmarkId.textContent);
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
        case 'previous-bookmark':
          ui.previousBookmark();
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
    browser.runtime.sendMessage({ message : 'check-confirmations-state' });

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
   * This method is used to show the previous bookmark.
   *
   * @returns {void}
   */
  previousBookmark () {
    browser.runtime.sendMessage({ message : 'previous' });
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
window.addEventListener('keydown', ui.handleKeyPress);
elBody.addEventListener('click', ui.handleButtonClicks);

elEnableConfirmations.addEventListener('change', (e) => {
  ui.confirmations = e.target.checked;
  browser.storage.local.set({ confirmations : e.target.checked });
});

browser.runtime.onMessage.addListener(ui.handleResponse);
