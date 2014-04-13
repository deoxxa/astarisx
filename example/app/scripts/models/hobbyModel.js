/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbyModel = IMVVM.createModel({
  
  id: {
    get: function(){
      return this.state.id;
    }    
  },

  name: {
    get: function(){
      return this.state.name;
    },
    set: function(newValue){
      this.setState({'name': newValue });
    }
  },

});