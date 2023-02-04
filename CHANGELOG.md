### Version 3.0.0 (Work in Progress)

#### Notable Changes

- bumped the minimum required Firefox version to Firefox 109, fixes
  [#55](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/55)
- removed testpilot.firefox.com from internal skip list because this domain is not part of
  extensions.webextensions.restrictedDomains, fixes [#41](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/41)
- changed copyright year from 2022 to 2023, fixes [#54](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/54)

#### Code Quality

- optimized image files to save a few bytes, fixes [#57](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/57)
- updated the translation mechanism to the newest version to share more code with other extensions and to improve the
  maintainability, fixes [#40](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/40)

#### Bugfixes

- the 'remove all from whitelist' button was seen briefly on the whitelist screen if the whitelist was empty,
  fixes [#38](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/38) (Thanks, alexmajor!)

#### Dependencies

- updated eslint from version 8.5.0 to 8.33.0 and updated configuration
- updated eslint-plugin-compat from version 4.0.0 to 4.0.2
- updated eslint-plugin-no-unsanitized from version 4.0.1 to 4.0.2
- updated eslint-plugin-promise from version 6.0.0 to 6.1.1
- updated eslint-plugin-xss from version 0.1.11 to 0.1.12
- updated gulp-eslint-new from version 1.1.0 to 1.7.1
- updated jsdoc from version 3.6.7 to 4.0.0
- updated stylelint from version 14.2.0 to 14.16.1 and updated configuration
- updated stylelint-csstree-validator from version 2.0.0 to 2.1.0
- updated stylelint-order from version 5.0.0 to 6.0.1
- updated webext from version 6.6.0 to 7.5.0

[All Changes](https://github.com/cadeyrn/keep-or-delete-bookmarks/compare/v2.0.1...master)

---

### [Version 2.0.1](https://github.com/cadeyrn/keep-or-delete-bookmarks/releases/tag/v2.0.1) (2021-12-23)

#### Translations

- added Japanese translation (Thanks, Shitennouji!), fixes
  [#18](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/18)

#### Dependencies

- updated stylelint from version 14.1.0 to 14.2.0

[All Changes](https://github.com/cadeyrn/keep-or-delete-bookmarks/compare/v2.0.0...v2.0.1)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/versions/?page=1#version-2.0.1)

---

### [Version 2.0.0](https://github.com/cadeyrn/keep-or-delete-bookmarks/releases/tag/v2.0.0) (2021-12-22)

#### New Features

- Keep or Delete Bookmarks now checks for broken bookmarks! An internal skip list is used for domains that are known
  to be unverifiable. This is the reason why the add-on needs the permission to access your data for all sites starting
  with this update, fixes [#9](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/9)
- added ability to show previous bookmark after skipping, fixes
  [#13](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/13)
- added keyboard support, fixes [#3](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/3)
    - Left Arrow: show previous bookmark
    - Right Arrow: show next (random) bookmark
    - Enter: open bookmark
    - Space: add bookmark to whitelist
    - Backspace: delete bookmark (or opens confirmation dialog if enabled)
    - in bookmark deletion confirmation dialog:
        - ESC: close dialog
        - Enter: delete bookmark
- added the date when a bookmark was added to Firefox, fixes
  [#10](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/10)

#### Notable Changes

- bumped the minimum required Firefox version to Firefox 91, fixes
  [#31](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/31)
- changed copyright year from 2019 to 2022, fixes [#30](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/30)

#### Code Quality

- replaced deprecated method call, fixes [#29](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/29)
- fixed some code style issues and typos, fixes [#32](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/32)

#### Bugfixes

- fixed wrong tooltip for removing a bookmark from the whitelist, fixes
  [#33](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/33)

#### Dependencies

- replaced gulp-eslint 6.0.0 with gulp-eslint-new 1.1.0
- updated eslint from version 6.0.1 to 8.5.0 and updated configuration
- updated eslint-plugin-compat from version 3.0.2 to 4.0.0
- updated eslint-plugin-no-unsanitized from version 3.0.2 to 4.0.1
- updated eslint-plugin-promise from version 4.2.1 to 6.0.0
- updated eslint-plugin-xss from version 0.1.9 to 0.1.11
- updated gulp-htmllint from version 0.0.16 to 0.0.19
- updated gulp-jsdoc3 from version 2.0.0 to 3.0.0
- updated gulp-stylelint from version 9.0.0 to 13.0.0
- updated jsdoc from version 3.6.3 to 3.6.7
- updated stylelint from version 10.1.0 to 14.1.0 and updated configuration
- updated stylelint-csstree-validator from version 1.5.2 to 2.0.0
- updated stylelint-order from version 3.0.1 to 5.0.0
- updated webext from version 3.1.0 to 6.6.0

[All Changes](https://github.com/cadeyrn/keep-or-delete-bookmarks/compare/v1.0.1...v2.0.0)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/versions/?page=1#version-2.0.0)

---

### [Version 1.0.1](https://github.com/cadeyrn/keep-or-delete-bookmarks/releases/tag/v1.0.1) (2019-07-15)

#### Translations

- added Dutch translation (Thanks, PanderMusubi!)
- added Upper Sorbian translation (Thanks, milupo!)
- added Lower Sorbian translation (Thanks, milupo!)
- fixed typos in English translation

#### Dependencies

- updated jsdoc from version 3.6.2 to 3.6.3

[All Changes](https://github.com/cadeyrn/keep-or-delete-bookmarks/compare/v1.0.0...v1.0.1)<br />
[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/versions/?page=1#version-1.0.1)

---

### [Version 1.0.0](https://github.com/cadeyrn/keep-or-delete-bookmarks/releases/tag/v1.0.0) (2019-07-13)

- initial release for [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/)

#### Features of the first version

- Keep or Delete Bookmarks always shows one random bookmark
- You can keep or delete the bookmark, you can open the bookmark in a new tab or you can defer the decision
- After an action Keep or Delete Bookmarks shows you the next bookmark
- Keep or Delete Bookmark makes sure that you never see the same bookmark two times in a row
- There is a confirmation dialog when you press the delete button
- You can disable the confirmation dialogs with one click
- You can also remove bookmarks from the whitelist at any time
- Translations: English, German

[Download Signed WebExtension](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/versions/?page=1#version-1.0.0)
