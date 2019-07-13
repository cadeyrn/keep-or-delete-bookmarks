'use strict';

const elBody = document.querySelector('body');
const elNoBookmarks = document.getElementById('no-bookmarks');
const elWhitelistTable = document.getElementById('whitelist-table');

/**
 * @exports options
 */
const options = {
  /**
   * Fired when the initial HTML document has been completely loaded and parsed. Shows the bookmark whitelist.
   *
   * @returns {void}
   */
  init () {
    options.listBookmarks();
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
        case 'remove-all-from-whitelist':
          options.emptyWhitelist();
          break;
        default:
        // do nothing
      }
    }
  },

  /**
   * List all the bookmarks on the whitelist.
   *
   * @returns {void}
   */
  async listBookmarks () {
    const { whitelist } = await browser.storage.local.get({ whitelist : {} });
    const whitelistLength = Object.keys(whitelist).length;

    // show notice if the whitelist is empty, otherwise show the bookmarks on the whitelist
    if (whitelistLength === 0) {
      elNoBookmarks.removeAttribute('hidden');
      elWhitelistTable.setAttribute('hidden', true);
    }
    else {
      elNoBookmarks.setAttribute('hidden', true);
      elWhitelistTable.removeAttribute('hidden');
    }

    if (whitelistLength > 0) {
      // tbody element, bookmark rows will be added here
      const elTableBody = elWhitelistTable.querySelector('tbody');

      // remove old content
      while (elTableBody.firstChild) {
        elTableBody.removeChild(elTableBody.firstChild);
      }

      // add bookmarks to table in reversed order (newest at top)
      Object.keys(whitelist).reverse().forEach((id) => {
        // row
        const elRow = document.createElement('tr');
        elTableBody.appendChild(elRow);

        // name column
        const elNameColumn = document.createElement('td');
        elNameColumn.textContent = whitelist[id].title;
        elRow.appendChild(elNameColumn);

        // URL column
        const elUrlColumn = document.createElement('td');
        const pattern = new RegExp(/^https?:\/\//, 'gi');

        if (pattern.test(whitelist[id].url)) {
          const elUrl = document.createElement('a');
          elUrl.setAttribute('href', whitelist[id].url);
          elUrl.setAttribute('target', '_blank');
          elUrl.setAttribute('rel', 'noopener');
          elUrl.textContent = whitelist[id].url;
          elUrlColumn.appendChild(elUrl);
        }
        else {
          elUrlColumn.textContent = whitelist[id].url;
        }

        elRow.appendChild(elUrlColumn);

        // path column
        const elPathColumn = document.createElement('td');
        elPathColumn.textContent = whitelist[id].path;
        elRow.appendChild(elPathColumn);

        // icon column
        const elIconColumn = document.createElement('td');
        elIconColumn.classList.add('actions');
        elRow.appendChild(elIconColumn);

        // remove icon
        const elRemoveLink = document.createElement('a');
        elRemoveLink.setAttribute('title', browser.i18n.getMessage('whitelist_delete_bookmark'));
        elRemoveLink.setAttribute('data-idx', id);
        elRemoveLink.classList.add('icon', 'trash-icon');
        elRemoveLink.addEventListener('click', options.removeFromWhitelist);
        elIconColumn.appendChild(elRemoveLink);

        const elRemoveIcon = document.createElement('img');
        elRemoveIcon.src = '/images/cross.svg';
        elRemoveIcon.setAttribute('alt', browser.i18n.getMessage('whitelist_delete_bookmark'));
        elRemoveLink.appendChild(elRemoveIcon);
      });
    }
  },

  /**
   * Removes a bookmark from the whitelist.
   *
   * @param {MouseEvent} e - event
   *
   * @returns {void}
   */
  async removeFromWhitelist (e) {
    e.preventDefault();

    const { whitelist } = await browser.storage.local.get({ whitelist : {} });
    delete whitelist[e.target.parentNode.getAttribute('data-idx')];
    browser.storage.local.set({ whitelist : whitelist });

    options.listBookmarks();
  },

  /**
   * Removes all bookmarks from the whitelist.
   *
   * @returns {void}
   */
  emptyWhitelist () {
    browser.storage.local.set({ whitelist : {} });
    options.listBookmarks();
  }
};

document.addEventListener('DOMContentLoaded', options.init);
elBody.addEventListener('click', options.handleButtonClicks);
