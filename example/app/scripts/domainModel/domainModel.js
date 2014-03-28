/* global IMVVM */

var DomainModel = IMVVM.createDomainModel({
  
getInitialState: function(nextState, prevState){ //Optional
    return { 
      canUndo: !!nextState.previousState,
      online: typeof nextState.online === 'boolean' ? nextState.online : false,
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