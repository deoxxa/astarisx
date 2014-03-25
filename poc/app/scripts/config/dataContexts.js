/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.DataContexts = (function(App){
  var dataContexts = {
  	'persons': {
  		viewModel: App.PersonsViewModel,
			initArgs : [],
			dependsOn: [{property: 'hobbies.selected', alias: 'selectedHobby'},
                  {property: 'online', alias: 'imOnline'}]
		},
		'hobbies': {
			viewModel: App.HobbiesViewModel,
			initArgs : [],
			dependsOn: [{property: 'persons.selected', alias: 'selectedPerson'},
                  {property: 'persons.selected.hobbies', alias: 'personHobbies'}]
		}
  };
  return dataContexts;
}(MyApp));