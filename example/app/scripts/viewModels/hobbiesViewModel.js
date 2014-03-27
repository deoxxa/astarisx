/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
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
    //this.appState.busy = true;
	},
	
	deleteHobby: function(value){
		this.persons_selected.deleteHobby(value);
	},

	//When a dependency changes reset the selected hobby to undefined
	resetSelected: function(state, prevState) {
    if(prevState && prevState.persons_selected && state.persons_selected){
      if(state.persons_selected.id !== prevState.persons_selected.id &&
    		state.selected !== void 0){
  				return void 0;
    	}
    }
  	return state.selected;
  },

	getInitialState: function(state, prevState){
		return { 
      selected: this.resetSelected(state, prevState),
    }
	},

	selected: {
		get: function(){
			return this.state.selected;
		}
	},
});
