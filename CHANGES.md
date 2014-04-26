## 0.6.17

 - `this.extend` dreprecated. Replaced with `IMVVM.extend`. Will no longer be available in version `0.7.0+`
 - The following functions are no longer exposed to the View
     + getDomainDataContext
     + getInitialState
     + getWatchedState
     + \_\_getDescriptor - this has been entirely removed
 - Started promoting the use of the module pattern in order to hide implementation specific descriptor definitions/functions from the View. This is prodominately reflected in the reference implementation.
 - Updated reference implementation.


