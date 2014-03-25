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
      console.log('in herer');
      console.log(this);
			var nextState = this.extend(this);
			nextState.selected = this.personHobbies.filter(function(hobby){
				return hobby === value;
			})[0];
      console.log(nextState);
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
			prevState = prevState || {};
    	if(prevState.dependencies &&
    		state.dependencies.selectedPerson.id !== prevState.dependencies.selectedPerson.id &&
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

		// collectionItems: { 
		// 	enumerable: false,
		// 	get: function(){
		// 		return this.state.dependencies.hobbies;
		// 	}
		// },
		
		// selectedPerson: { 
		// 	enumerable: false, //deps are always enum === false
		// 	get: function(){
		// 		return this.state.dependencies.selectedPerson;
		// 	}
		// },

		selected: {
			enumerable: true,
			get: function(){
				return this.state.selected;
			}
		},
  });
  return HobbiesViewModel;

}(MyApp, IMVVM));