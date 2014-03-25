/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.HobbiesViewModel = (function(App, IMVVM){
  var HobbiesViewModel = IMVVM.createViewModel({
  	select: function(value){
			var nextState = {};
			nextState.selected = this.personHobbies.filter(function(hobby){
				return hobby === value;
			})[0];
			this.setState(nextState);
		},
		
		addHobby: function(value){
			this.selectedPerson.addHobby(value);
		},
		
		deleteHobby: function(value){
			this.selectedPerson.deleteHobby(value);
		},

		//When a dependency changes reset the selected hobby to undefined
		resetSelected: function(state, prevState) {

      if(prevState && state.selectedPerson.id !== prevState.selectedPerson.id &&
    		state.selected !== void 0){
					return void 0;
    	}
    	return state.selected;
	  },

		getInitialState: function(state, prevState){
			return { 
        selected: this.resetSelected(state, prevState),
      }
		},

		selected: {
			enumerable: true,
			get: function(){
				return this.state.selected;
			}
		},
  });
  return HobbiesViewModel;

}(MyApp, IMVVM));