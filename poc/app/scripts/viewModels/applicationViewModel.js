/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var ApplicationViewModel = IMVVM.createAppViewModel({
  
  getInitialState: function(state){ //Optional
    return { 
      canUndo: !!state.previousState,
      online: typeof state.online === 'boolean' ? state.online : false,
      busy: typeof state.busy === 'boolean' ? state.busy : false
    }
  },

  init: function(args){ //optional
    return this.DataContext(extend(args,{online: true }));
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

  busy: {
    get: function(){
      return this.state.busy;
    }
  },

  online: {
    get: function(){
      return this.state.online;
    }
  },
});