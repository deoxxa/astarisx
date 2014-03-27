/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/* global IMVVM */

'use strict';

var DomainModel = IMVVM.createDomainModel({
  
getInitialState: function(state){ //Optional
    return { 
      canUndo: !!state.previousState,
      online: typeof state.online === 'boolean' ? state.online : false,
    }
  },

  init: function(args){ //optional
    var nextState = {};
    nextState.online = true;
    return this.DataContext(this.extend(args,nextState));
  },

  undo: function(){
    if(this.canUndo){
      this.setState(this.previousState);
    }
  },

  canUndo: {
    get: function(){
      return !!this.state.previousState;
    },
  },

  appName: {
    get: function(){
      return this.state.appName;
    },
  },

  online: {
    get: function(){
      return this.state.online;
    }
  },
});