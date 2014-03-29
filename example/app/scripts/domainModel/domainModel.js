
/* global IMVVM */

'use strict';

var DomainModel = IMVVM.createDomainModel({
  
getInitialState: function(nextState, prevState){ //Optional
    return { 
      online: typeof nextState.online === 'boolean' ? nextState.online : false,
    }
  },

  init: function(args){ //optional
    var nextState = {};
    nextState.online = true;
    return this.DataContext(this.extend(args,nextState));
  },

  undo: function(){
    this.setState(this.previousState);
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