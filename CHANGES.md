## 0.10.0-beta

- added auto-binding for setState callbacks.
- Enable mixins for ViewModels
- add dispose() to ViewModels. Automatically called on Astarisx UI component unmount.
- add signInUrl as init param to ControllerViewModel
- Bug fix: removed use of `__ proto __`. Broke in IE.
- add Model validation. Field descriptor takes a `validate` object with a getter that returns a bool. Adds `$[fieldName]Valid` as a field to the model. Also adds `$allValid` field that check all the `validate` descriptors return true.
- expose uuid() on Astarisx object
- allow 'enumerable' attribute to be set in model fields. default is enumerable:true
- added `kind:’object’`, `kind:’object:freeze’`, `kind:’object:deepFreeze’`, `kind:’array:freeze’`, `kind:’array:deepFreeze’`
- Bug fix: adhoc undo i.e. `{ enableUndo: true }` error.
- Bug fix: prevAdhocUndo removed from if statement in CVM.
- Enable client-side only fields in Models. Getter/Setter fields prefixed with an underscore will not be sent to the server. Can be overridden if `enemurable`is set in field descriptor.
- empty setState simply returns the processed appState and no longer processes everthing.
- Models have `$dirty` flag automatically. It get's updated to `true` when changes to the Model occur, but must be set to `false` or `undefined` by the implementator after update and Model is no longer considered dirty.
- `__clientFields` function on Models returns an array of the Model's client fields.
- Client fields are now included in the returned object resulting from a call to `extend`.
- Allow Models to have `mixins`
- `mixins`: If a mixin field is getter or setter and is not defined in originalSpec it will be added unless it already exists in the originalSpec wins. Otherwise last prop wins.
- `mixins`: If a mixin method begins with `get` is assumed that it takes no arguments and returns a merge object result. Last props win. For other methods it is assumed that they do not return a result, however if the method is unique it will be assigned directly to the originalSpec and can return a result if one has been defined.
- add `kind`: `pseudoObject`, `pseudoObject:freeze`, `pseudoObject:deepFreeze`, `pseudoArray`, `pseudoArray:freeze`, `pseudoArray:deepFreeze`
- empty transientState will now call callbacks
- `Model`'s can now specify `kind: "instance"` for embedded model objects
- Rename objects variable names (see Breaking Changes)
- RouteChangeHandlers are now passed `appContext` as the second argument
- Linked data contexts specified in `getWatchedState`, can only see "real" fields and no longer have access to the ViewModel functions
- Models are able to pass nextAppState (i.e. state for the ControllerViewModel) to `setState` as the second argument
- Models no longer take a boolean to initialize
- Prefix reserved `setState` attributes, CVM reserved fields and `viewKey` prop with '$' to avoid naming conflicts
- Added `$owner`. This is passed to Models if within a Model you are referencing the same Model for different fields as `kind: "instance"`. This is necessary because `setState` is assigned to the prototype and cannot differentiate the caller. The `$owner` field ensures that the correct model is updated.

```javascript
primaryContact: {
  kind: 'instance',
  get: function(){
    return new Contact(this._state.primaryContact, {$owner:"primaryContact"});
  },
  validate: {
    get: function(){
      return this.primaryContact.name.length > 0;
    }
  }
},

secondaryContact: {
  kind: 'instance',
  get: function(){
    return new Contact(this._state.secondaryContact, {$owner:"secondaryContact"});
  }
},
```

- setState can now receive a callback as it's first argument
- Bug fix: Models are not marked as `$dirty` if they do not have new state. Note that private fields (i.e. fields starting with an underscore) do not mark a Model as `$dirty` if their state changes as these fields do not persist to the backend.
- Added `$dataContext` property to ViewModels indicating the dataContext name given to it in the ControllerViewModel

### Breaking Changes
- New initialization process. React.renderComponent no longer takes Astarisx application arguments. Initialization occurs in the `ui` component in `componentWillMount` using `this.initializeAppContext` which takes the necessary arguments to be passed to the ControllerViewModel `dataContextWillInitialize`.
- `this.intializeDataContext` now accepts either no args, '*', '_*', dataContext names as strings or Objects with dataContext names as keys with the value being the args to be passed to each dataContext OR both strings and Objects OR an array of string and Objects during initialization.
- fields of `kind:"array"` do not have a set method, it is removed to prevent inadvertently updating the array by assignment. Must update arrays using methods and calling `setState`.
- Renamed the following:
  - `state` to `_state`
  - `previousState` to `_previousState`
  - `nextState` to `_nextState`
* RouteChangeHandlers are now passed `appContext` as the second argument
* Linked data contexts specified in `getWatchedState`, can only see "real" fields and no longer have access to the ViewModel functions
* `revert()` and `advance()` can now take a callback as an argument
* Models no longer take a boolean to initialize. Remove all booleans from Model instantiations.
* Prefix reserved `setState` attributes, CVM reserved fields and `viewKey` prop with '$' to avoid naming conflicts

## 0.9.6-beta

- change CustomEvent polyfill test to use typeof.
- if kind === 'array' then delete `set`. Can only update arrays via a function on the Model or ViewModel
- if return 'null' from render() within a View then create a dummy element to attach View event listener to
- pass in handler when removing View event listener

## 0.9.5-beta

- Bug Fix: CustomEvent polyfill wasn't working for IE11, so added extra test to see if it was a function.

## 0.9.4-beta

- call ControllerViewModel's `dataContextWillInitialize` before UI container component mounts.

## 0.9.3-beta

- Allow Array of dataContext names to be passed to `initializeDataContext`. If empty args then all dataContexts will be initialized.

## 0.9.2-beta

- Added `initializeDataContext(string)` to ControllerViewModel i.e. `this.state.appContext.intializeDataContext([dataContextName])`. This enabled `dataContextWillInitialize` calls to be deferred, allowing lazy loading of initial data.
- Added `currentState()` to stateManager so that the current state can be retrieved.

## 0.9.1-beta

- clean up stateManager.

## 0.9.0-beta

- __Deprecate__: IMVVM -> Change name to Astarisx
- Add `delay` param to setState. => `delay` is the number of milliseconds (thousandths of a second) that the function call should be delayed by and is passed as the last argument when there is a callback function used. The effect is sequential updates (no batching).
- setState optional argument `forget` is now `remember`. default = `true`. Only applicable in ControllerViewModel and ViewModels
- __Deprecate__: createModel()
- Add `createModelClass()` to _replace_ createModel()
- Add `createMClass()` => short form for createModelClass()
- __Deprecate__: createViewModel()
- Add `createViewModelClass()` to _replace_ createViewModel()
- Add `createVMClass()` => short form for createViewModelClass()
- __Deprecate__: createDomainViewModel()
- Add `createControllerViewModelClass()` to _replace_ createDomainViewModel()
- Add `createCVMClass()` => short form for createControllerViewModelClass()
- __Deprecate__: `domainDataContext` as default prop in this.state.domainDataContext
- __Deprecate__: `domainModel` prop in React's render component call and _replace_ with `controllerViewModel`
- _Replace_ default `this.state.domainDataContext` with `this.state.appContext`
- add prop `enableRouting` to React.renderComponent component
- Change `mixin.main` to `mixin.ui`
- Add `mixin.view` in order to specify a component as a View
- Add `mixin.display` in order to specify a component as a Display. Animation display requires `appContext` to be passed as prop.
- Add `mixin.page` in order to specify a component as a Page. Animation page requires `appContext` to be passed as prop.
- Add `mixin.view.display` in order to specify a component as a Display View. Animation display no props required to be passed as prop.
- Add `mixin.view.page` in order to specify a component as a Page View. Animation page no props required to be passed as prop.
- Components that have `mixin.view`, `mixin.view.display`, `mixin.view.page` add/remove event a listener for CustomEvent stateChange.
- Add `notify` to ControllerViewModel in order to specify which View should be notified
- Add optional `viewKey` prop to View components to help identify the View to be notified when using `notify`
- Auto add `viewKey` prop to Views if animation mixin used.
- Auto add `containerType` to Views, Displays and Pages `this.state`
- Views no longer require properties or state to be passed in
- Add `mixins` property to enable ControllerViewModel to mixin [IMVVAnimateMixin](https://github.com/entrendipity/imvvm-animate)
- `AstarisxAnimate` adds the following properties to `this.state.appContext`
    + display
    + displayGroup
    + displayKey
    + page
- `AstarisxAnimate` adds the following functions to `this.state.appContext`
    + animate
    + getDisplay
    + cueDisplay
    + dropDisplay
    + getPage
    + cuePage
    + dropPage
    + addListItem
    + dropListItem
    + show
    + addDisplays (system)
    + addTransitions (system)
- Added `getTranstions()` to `ControllerViewModel`
- Added `getDisplays()` to `ViewModel`
- Added ability for Route Path during page transitions. pass in , `transitionTo` as last argument to route handler

### Breaking Changes
- All deprecated items are removed and not available
- `IMVVM` -> Change all references to `Astarisx`
- In the UI Container i.e. the React component that references `Astarisx.mixin.main`, change `Astarisx.mixin.main` to `Astarisx.mixin.ui`
- In the UI Container i.e. the React component that references the Astarisx mixin `Astarisx.mixin.ui`, change all references of `this.state.domainDataContext` to `this.state.appContext`
- In React.renderComponent change the UI Container Component prop `domainModel` to `controllerViewModel`
- If pushState Routing is being used then, in React.renderComponent add prop `enableRouting = {true}` to UI Container Component
- change setState optional argument `forget` to `remember` with default `true`. i.e. flip the boolean. Only applicable in ControllerViewModel and ViewModels
- ___Update all `createXXX` calls to reflect the new names. Short form can be used___

## 0.8.7

- Make Model `__stateChangeHanlder` property `enumerable` = `false`.
- Fix `dataContextWillUpdate` bug: Undo\Redo did not show State

## 0.8.6

- Added `dataContextWillUpdate` object to `domainDataContext.state`. This object is dynamic and only holds the values of the state that will change. It is intended to be used within React's `shouldComponentUpdate`.

## 0.8.5

- Added MediaQueryList Notifications via IMVVM.mixin.mediaQuery
- Add `mediaChangeHandler` function to DomainViewModel. Required when IMVVM.mixin.mediaQuery is specified. Signature: `mediaChangeHandler(id, mql, initializing)`. `id` is defined in the `@media` attribute in the css file. The first selector must be `.media#[id]` with empty definition n.b. comment may be needed for it to work due to some css minifiers i.e. `.media#ipad { /**/ }`
- changed stateChangedHandler -> stateChangeHandler
- Added `kind:static`: Fields designated as `static` will not affect undo\redo functionality when their state changes. Only available to DomainViewModel fields

## 0.8.4

- Reference React DOM node directly to add event listener in mixin.pushState. Removing dependancy on jQuery ie. '$' making it easier to use in NodeJS

## 0.8.3

- Bug fix: Remove finally from try catch during callback in stateController
- Bug fix: Assign appState to newState when not args passed to setState to ensure that State is reflected correctly

## 0.8.2

- Bug fix: Allow initial AppState to be passed to View even when dataContextWillInitialize

## 0.8.1

- Add pushState router
- Split mixin => IMVVM.mixin.main, IMVVM.mixin.pushState ***(Breaking Change) Change mixin from IMVVM.mixin to IMVVM.mixin.main***
- Added `getRoutes` function
- Added `path` to Domain Data Context
- Added `forceReplace`: true || false property to Domain Data Context
- Added `pushState`: true || false to Domain Data Context
- Added readonly `pageNotFound` to Domain Data Context
- Added `kind:uid`: For future use
- Automatic pushState for 'a' tags if pushState mixed in
- Added ad-hoc `enableUndo`: true || false to Domain Data Context
- rename core.js => stateController.js
- rename imvvm.js => core.js
- rename imvvmDomainViewModel => domainViewModel
- rename imvvmViewModel => viewModel
- rename imvvmModel => model
- Bug fix: Domain Data Context watchedState did not link if it wasn't in appState.state during initialization
- Added `dataContextWillInitialize` to DomainViewModel and ViewModels
- setState callbacks now return an error as the first argument. i.e. callback(err, appContext) ***(Breaking Change) Add `error` argument to first param of setState callbacks***
- setState can now be called with no arguments eg. this.setState()
- setState takes extra optional argument `forget` of Type Boolean. Only applicable in DomainViewModel and ViewModels

## 0.8.0

- skipped version number

## 0.7.6

- Bug fix: callback not firing when transient state exists

## 0.7.5

- skipped version number

## 0.7.4

- Bug fix: error if appNamespace not in links

## 0.7.3

- aliasFor alias now is able to be referenced in Model getInitialState

## 0.7.2

- only call getInitialState on ViewModels once

## 0.7.1

- callbacks return domainDataContext
- rename `undo` to `revert`
- rename `redo` to `advance`
- rename `canUndo` to `canRevert`
- rename `canRedo` to `canAdvance`

## 0.7.0

- stateChangedHandler now only provides `nextState` argument. `prevState` has been removed
- `this.extend` removed. Use IMVVM.extend.
- Enabled multiple models within one ViewModel.

## 0.6.20

- Catch error for invalid 'kind' value
- Bug Fix: Data Context gets relinked before trigger event is called. This ensures that the ViewModel has the latest state.
- Calling implementation specific functions from originalSpec object, rather than attaching to prototype then deleting them

## 0.6.18-19

- Nothing changed from 0.6.17. Issues with NPM meant I had to bump version.

## 0.6.17

- start changelog
- `this.extend` deprecated. Replaced with `IMVVM.extend`. Will not be available in version `0.7.0+`
- The following functions are no longer exposed to the View
     + getDomainDataContext
     + getInitialState
     + getWatchedState
     + \_\_getDescriptor - this has been entirely removed
- Started promoting the use of the module pattern in order to hide implementation specific descriptor definitions/functions from the View. This is reflected in the reference implementation.
- Updated reference implementation.