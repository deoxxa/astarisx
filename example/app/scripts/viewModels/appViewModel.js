/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/* global IMVVM */

'use strict';

var AppViewModel = IMVVM.createViewModel({
  appStateChangedHandler: function(viewModel) {
    return function(newState){
      var nextState = {};
      nextState.appState = viewModel.AppState(newState);
      viewModel.setState(nextState);
    };
  },
  AppState: function(someState){
    return AppModel(this.appStateChangedHandler)(someState);
  },
  getInitialState: function(state, prevState){
    return {
      busy: !state.appState || state.appState.busy === void 0 ? false : state.appState.busy
    }
  },
  appState: {
    get: function(){
      return this.state.appState;
    }
  },
  // busy: {
  //   enumerable: false,
  //   get: function(){
  //     return this.state.busy;
  //   }
  // },
  init: function() {
    var nextState = {};
    nextState.appState = this.AppState({busy: false});
    //nextState.busy = nextState.appState.busy;
    return this.DataContext(nextState);
  }
});