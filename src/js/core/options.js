'use strict';

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
   * List all the bookmarks on the whitelist.
   *
   * @returns {void}
   */
  async listBookmarks () {
    const { whitelist } = await browser.storage.local.get({ whitelist : [] });
    const whitelistLength = whitelist.length;

    // show notice if the whitelist is empty, otherwise show the bookmarks on the whitelist
    if (whitelistLength === 0) {
      elNoBookmarks.removeAttribute('hidden');
      elWhitelistTable.setAttribute('hidden', true);
    }
    else {
      elNoBookmarks.setAttribute('hidden', true);
      elWhitelistTable.removeAttribute('hidden');
    }

    if (whitelist.length > 0) {
      const bookmarks = await browser.bookmarks.get(whitelist);

      // tbody element, bookmark rows will be added here
      const elTableBody = elWhitelistTable.querySelector('tbody');

      // remove old content
      while (elTableBody.firstChild) {
        elTableBody.removeChild(elTableBody.firstChild);
      }

      // add bookmarks to table
      for (let i = 0; i < whitelistLength; i++) {
        // row
        const elRow = document.createElement('tr');
        elTableBody.appendChild(elRow);

        // name column
        const elNameColumn = document.createElement('td');
        elNameColumn.textContent = bookmarks[i].title;
        elRow.appendChild(elNameColumn);

        // icon column
        const elIconColumn = document.createElement('td');
        elIconColumn.classList.add('actions');
        elRow.appendChild(elIconColumn);

        // remove icon
        const elRemoveLink = document.createElement('a');
        elRemoveLink.setAttribute('href', '#');
        elRemoveLink.setAttribute('title', browser.i18n.getMessage('whitelist_delete_bookmark'));
        elRemoveLink.setAttribute('data-idx', i);
        elRemoveLink.classList.add('icon', 'trash-icon');
        elRemoveLink.addEventListener('click', options.removeFromWhitelist);
        elIconColumn.appendChild(elRemoveLink);

        const elRemoveIcon = document.createElement('img');
        elRemoveIcon.src = '/images/trash.svg';
        elRemoveIcon.setAttribute('alt', browser.i18n.getMessage('whitelist_delete_bookmark'));
        elRemoveLink.appendChild(elRemoveIcon);
      }
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

    const { whitelist } = await browser.storage.local.get({ whitelist : [] });
    whitelist.splice(e.target.parentNode.getAttribute('data-idx'), 1);
    browser.storage.local.set({ whitelist : whitelist });

    options.listBookmarks();
  }
};

document.addEventListener('DOMContentLoaded', options.init);
