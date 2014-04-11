/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbyModel = IMVVM.createModel({
  
  // getInitialState: function(){
  //   return {
  //     //age: this.calculateAge(this.dob),
  //   };
  // },
  id: {
    //kind: 'uid',
    get: function(){
      return this.state.id;
    }    
  },

  name: {
    get: function(){
      return this.state.name;
    },
    set: function(newValue){

      console.log('this ----------');
      console.log(this);

      this.setState({'name': newValue });
    }
  },

});