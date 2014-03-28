/*jshint camelcase:false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
	select: function(value){
		var nextState = {};
		nextState.selected = this.persons_selected.hobbies.filter(function(hobby){
			return hobby === value;
		})[0];
		this.setState(nextState);
	},
	
	addHobby: function(value){
		this.persons_selected.addHobby(value);
	},
	
	deleteHobby: function(value){
		this.persons_selected.deleteHobby(value);
	},

	//When a dependency changes reset the selected hobby to undefined
	resetSelected: function(nextState, prevState) {
    if(prevState && prevState.persons_selected && nextState.persons_selected){
      if(nextState.persons_selected.id !== prevState.persons_selected.id &&
    		nextState.selected !== void 0){
  				return void 0;
    	}
    }
  	return nextState.selected;
  },

	getInitialState: function(nextState, prevState){
		return { 
      selected: this.resetSelected(nextState, prevState),
    }
	},

	selected: {
		get: function(){
			return this.state.selected;
		}
	},
});
