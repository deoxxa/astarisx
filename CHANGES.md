## 0.6.17

 - `this.extend` deprecated. Replaced with `IMVVM.extend`. Will not be available in version `0.7.0+`
 - The following functions are no longer exposed to the View
     + getDomainDataContext
     + getInitialState
     + getWatchedState
     + \_\_getDescriptor - this has been entirely removed
 - Started promoting the use of the module pattern in order to hide implementation specific descriptor definitions/functions from the View. This is reflected in the reference implementation.
 - Updated reference implementation.
## 0.6.18-19

 - Nothing changed from 0.6.17. Issues with NPM meant I had to bump version.

## 0.6.20

 - Catch error for invalid 'kind' value
 - Bug Fix: Data Context gets relinked before trigger event is called. This ensures that the ViewModel has the latest state.
 - Calling implementation specific functions from originalSpec object, rather than attaching to prototype then deleting them

## 0.7.0

- stateChangedHandler now only provides `nextState` argument. `prevState` has been removed
- `this.extend` removed. Use IMVVM.extend.
- Enabled multiple models within one ViewModel.

## 0.7.1

- callbacks return domainDataContext
- rename `undo` to `revert`
- rename `redo` to `advance`
- rename `canUndo` to `canRevert`
- rename `canRedo` to `canAdvance`

## 0.7.2

- only call getInitialState on ViewModels once

## 0.7.3

- aliasFor alias now is able to be referenced in Model getInitialState

## 0.7.4

- Bug fix: error if appNamespace not in links

## 0.7.5

- skipped version number

## 0.7.6

- Bug fix: callback not firing when transient state exists

## 0.8.0

- Add pushState router
- Split mixin => IMVVM.mixin.main, IMVVM.mixin.pushState
- Added 'getRoutes' function
- Added 'path' to Domain Data Context
- Added 'forceReplace': true || false property to Domain Data Context
- Added 'pushState': true || false to Domain Data Context
- Added readonly 'pageNotFound' to Domain Data Context
- Automatic pushState for 'a' tags if pushState mixed in
- Added ad-hoc 'enableUndo': true || false to Domain Data Context
- rename core.js => stateController.js
- rename imvvm.js => core.js
- rename imvvmDomainViewModel => domainViewModel
- rename imvvmViewModel => viewModel
- rename imvvmModel => model
