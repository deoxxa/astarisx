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
		name: 'persons',
		viewModel: App.PersonsViewModel,
		initArgs : [],
		dependsOn: [{property: 'hobbies.selected', alias: 'selectedHobby'},
			{property: 'online'}],

	},{
		name: 'hobbies',
		viewModel: App.HobbiesViewModel,
		initArgs : [],
		dependsOn: [{property: 'persons.selected', alias: 'selectedPerson'}]
			//DI of sorts, but not real DI.
			//it's how Models communicate and
			//allows for cyclical references and
			//the ability to depend on other dependents
			//with the help of some code in the PM
	}];
	return dataContexts;
})(MyApp);