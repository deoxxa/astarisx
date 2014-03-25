/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var dataContexts = {
	'persons': {
		viewModel: PersonsViewModel,
		initArgs : [],
		dependsOn: [{property: 'hobbies.selected', alias: 'selectedHobby'},
                {property: 'online', alias: 'imOnline'}]
	},
	'hobbies': {
		viewModel: HobbiesViewModel,
		initArgs : [],
		dependsOn: [{property: 'persons.selected'}]
	}
};
