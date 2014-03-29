/* global IMVVM */

'use strict';

var AppViewModel = IMVVM.createViewModel({

  appStateChangedHandler: function(nextState, prevState/*, callback*/) {
    this.setState({appState: this.AppState(nextState)});
  },

  AppState: function(){
    return new AppModel(this.appStateChangedHandler).apply(this, arguments);
  },

  getInitialState: function(nextState, prevState){
    return {
      busy: !nextState.appState || nextState.appState.busy === void(0) ? false : nextState.appState.busy
    }
  },

  appState: {
    get: function(){
      return this.state.appState;
    }
  },

  init: function() {
    var nextState = {};
    nextState.appState = this.AppState({busy: false});
    return this.DataContext(nextState);
  }

});