
/* global IMVVM */

'use strict';

var AppModel = IMVVM.createModel({
  
  busy: {
    get: function(){
      return this.state.busy;
    },
    set: function(newValue){
      this.setState({'busy': newValue });
    }
  }
  
});

