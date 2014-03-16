'use strict';
var MyApp = MyApp || {};

MyApp.DataService = (function() {
	var dataService = {
		getData: function() {
			return [{id:'1', firstName:'Frank', lastName: "Smith", gender:'male', dob:'1980-03-03', occupation:'dentist', hobbies: ['reading', 'golf', 'computer programming']},
				{id:'2', firstName:'Lisa', lastName: "Jones", gender:'female', dob:'1985-02-22', occupation:'accountant', hobbies: ['reading']},
        { lastName: "ID", gender:'female', dob:'1975-12-11', occupation:'unemployed', hobbies: ['watching TV']}];
		}
	};
	return dataService;
}());