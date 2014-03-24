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
			var nextState = extend(this);
			nextState.selected = this.collectionItems.filter(function(hobby){
				return hobby === value;
			})[0];
			this.raiseStateChanged(nextState);
		},
		
		addHobby: function(value){
			this.state.dependencies.selectedPerson.addHobby(value);
		},
		
		deleteHobby: function(value){
			this.state.dependencies.selectedPerson.deleteHobby(value);
		},
		
		init: function(/*args*/){
			return this.DataContext();
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

		initialiseState: function(state, prevState){
			return { 
        //selected: state.selected || {},
        selected: this.resetSelected(state, prevState)
        //hobbies: state.hobbies || [],
      }
		},

		collectionItems: { 
			enumerable: false,
			get: function(){
				return this.selectedPerson.hobbies;
			}
		},
		
		selectedPerson: { 
			enumerable: false, //deps are always enum === false
			get: function(){
				return this.state.dependencies.selectedPerson;
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