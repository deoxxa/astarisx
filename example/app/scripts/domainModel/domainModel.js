
/* global IMVVM */

'use strict';

var DomainModel = IMVVM.createDomainModel({
  
getInitialState: function(nextState, prevState){ //Optional
    return { 
      online: typeof nextState.online === 'boolean' ? nextState.online : false,
      busy: nextState.busy === void(0) ? false : nextState.busy
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

  setBusyTo: function(val){
    this.setState({busy: val});
  }
});