/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.ApplicationViewModel = (function(IMVVM){
  var ApplicationViewModel = IMVVM.createAppViewModel({
    init: function(args){ //optional


      //Call transitionState with no params to initialize state 
      //and pass returned state to appState arg of setState
      //then more work will be done before returning with the new AppState
      //pass in any initial appState as second arg
      return this.DataContext(extend(args,{online: true }));
    },
    undo: function(){
      if(this.canUndo){
        this.setState(this.previousState);
      }
    },
    // May need to rename this - also in IMVVMModelInterface
    getInitialState: function(state){ //Optional
      return { 
        canUndo: !!state.previousState,
        online: typeof state.online === 'boolean' ? state.online : false,
        busy: typeof state.busy === 'boolean' ? state.busy : false
      }
    },
    appName: {
      enumerable: true,
      get: function(){
        return this.state.appName;
      },
    },

    canUndo: {
      enumerable: true,
      get: function(){
        return !!this.state.previousState;
      },
    },

    busy: {
      enumerable: true,
      get: function(){
        return this.state.busy;
      }
    },

    online: {
      enumerable: true,
      get: function(){
        return this.state.online;
      }
    },
  }); 

  return ApplicationViewModel;
}(IMVVM));