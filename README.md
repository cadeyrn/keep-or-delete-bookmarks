# Firefox Add-on: Keep or Delete Bookmarks (WebExtension)

<img src="src/images/logo-large.png" alt="Logo" width="790" border="0" />

## Description

**Cleaning up bookmarks is boring. The Firefox add-on Keep or Delete Bookmarks combines this task with some fun by
allowing you to sort the bookmarks like on "Tinder" or similar services.**

The add-on randomly displays one bookmark, including the title, the URL and the containing bookmark folder. The user has
several options:
 
1) Keep the bookmark. The bookmark will be added to a whitelist and Keep or Delete Bookmarks will never ask again about
this bookmark.

2) Delete the bookmark. The bookmark will be deleted from your Firefox.

3) Skip the bookmark and defer the decision. Keep or Delete Bookmarks will show you the next bookmark without any
action.

4) Open the bookmark. Maybe you are not sure about the bookmark yet. This options lets you open the bookmark in a new
tab before you make a decision.

**Keep or Delete Bookmarks is a WebExtension and compatible with Firefox Quantum (Firefox 68 and later).**

### Features

- Keep or Delete Bookmarks always shows one random bookmark
- You can keep or delete the bookmark, you can open the bookmark in a new tab and you can defer your decision
- After an action Keep or Delete Bookmarks shows you the next bookmark
- Keep or Delete Bookmark makes sure that you never see the same bookmark two times in a row
- There is a confirmation dialog when you press the delete button
- You can disable the confirmation dialogs with one click
- You can also remove bookmarks from the whitelist at any time

### Planned features

You can find the roadmap and request new features in the
[issues tracker](https://github.com/cadeyrn/keep-or-delete-bookmarks/issues).

### Languages

The add-on is currently available in the following languages:

- English
- German

### Permissions

Keep or Delete Bookmarks needs several permissions to work properly.

#### mandatory permissions

##### access browser tabs

The permission to access the browser tabs is needed so that Keep or Delete Bookmarks can jump to the already opened
user interface if the user interface is already opened in another tab and you click the button in the browser's toolbar.

##### read and modify bookmarks

You installed Keep or Delete Bookmarks to show and remove bookmarks so it should be clear why the permission is needed
to read and modify your bookmarks.

#### silent permissions

Keep or Delete Bookmarks needs some more permissions, but Firefox does not prompt for the following permissions:

##### menus

The menus permission is needed for providing a menu entry in the tools menu to access Keep or Delete Bookmarks's user
interface.

##### storage

The storage permission is needed so that Keep or Delete Bookmarks can remember which bookmarks you want to keep.

## Compatibility

Keep or Delete Bookmarks requires at least Firefox 68.

## Download

[Download Keep or Delete Bookmarks](https://addons.mozilla.org/en-US/firefox/addon/keep-or-delete-bookmarks/)

## Release Notes

[Release Notes](CHANGELOG.md "Release Notes")
