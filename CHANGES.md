## 0.6.17

 - `this.extend` dreprecated. Replaced with `IMVVM.extend`. Will not be available in version `0.7.0+`
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


