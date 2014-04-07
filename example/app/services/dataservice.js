'use strict';

var DataService = {
	getPersonData: function() {
		return [{id:'1', firstName:'Frank', lastName: "Smith", gender:'male', dob:'1980-03-03', occupation:'dentist', hobbies: ['reading', 'golfing', 'computer programming']},
			{id:'2', firstName:'Lisa', lastName: "Jones", gender:'female', dob:'1985-02-22', occupation:'accountant', hobbies: ['reading']},
      {id:'3', firstName: "John", lastName: "Citizen", gender:'male', dob:'1975-12-11', occupation:'unemployed', hobbies: ['watching TV']}];
	},
  getHobbiesData: function(uid) {
    var hobbies = [
    {
      id:'1',
      hobbies: [{id:'1', name: 'reading'}, {id:'2', name: 'golfing'}, {id:'3', name: 'computer programming'}]
    },
    {
      id:'2',
      hobbies: [{id:'1', name: 'reading'}]
    }, 
    {
      id:'3',
      hobbies: [{id:'1', name: 'watching TV'}]
    }];
    var personHobbies = hobbies.filter(function(person){
      return person.id === uid;
    });
    return personHobbies[0] ? personHobbies[0].hobbies : [];
  }
};
