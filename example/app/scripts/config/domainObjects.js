/* global AppViewModel, PersonsViewModel, HobbiesViewModel */

'use strict';

var domainObjects = {
	'hobbies': {
		viewModel: HobbiesViewModel,
		initArgs : [],
		dependsOn: [{property: 'persons.selected'},
								{property: 'myAppState.appState.busy', alias: 'appIsBusy'}]
	},
	'persons': {
		viewModel: PersonsViewModel,
		initArgs : [],
		dependsOn: [{property: 'hobbies.selected', alias: 'selectedHobby'},
                {property: 'online', alias: 'imOnline'}]
	},
	'myAppState': {
		viewModel: AppViewModel
	}
};
