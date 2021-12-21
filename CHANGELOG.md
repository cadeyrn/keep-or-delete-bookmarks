### Version 2.0.0 (Work in Progress)

#### New Features

- added keyboard support, fixes [#3](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/3)
    - Right Arrow: show next bookmark
    - Enter: open bookmark
    - Space: add bookmark to whitelist
    - Backspace: delete bookmark

#### Notable Changes

- bumped the minimum required Firefox version to Firefox 91, fixes
  [#31](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/31)
- changed copyright year from 2019 to 2022, fixes [#30](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/30)

#### Code Quality

- replaced deprecated method call, fixes [#29](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/29)
- fixed some code style issues and typos, fixes [#32](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues/32)

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

[All Changes](https://github.com/cadeyrn/keep-or-delete-bookmarks/compare/v1.0.1...master)

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
