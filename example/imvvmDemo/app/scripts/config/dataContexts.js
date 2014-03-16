/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

//Order matters! - specifies initialisation sequence of ViewModels
MyApp.DataContexts = (function(App){
	var dataContexts = [{ 
		viewModel: App.PersonsViewModel,
		name: 'persons',
		initArgs : [],
		watch: [{property: 'hobbies.selected', alias: 'selectedHobby'},
			{property: 'online'}],
		dependencies: [App.DataService, App.PersonModel] //Array order specifies how they appear in args
	}, {
		viewModel: App.HobbiesViewModel,
		name: 'hobbies',
		initArgs : [],
		watch: [{property: 'persons.selected', alias: 'selectedPerson'},
			/*{property: 'persons.selected.id', alias: 'personId'},
			{property: 'persons.selected.hobbies'}*/] //DI of sorts, but not real DI.
													//it's how Models communicate and
													//allows for cyclical references and
													//the ability to depend on other dependents
													//with the help of some code in the PM
	}];
	return dataContexts;
})(MyApp);