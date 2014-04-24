'use strict';

var DataService = {
	getPersonData: function() {
		return [{id:'1', firstName:'Frank', lastName: "Smith", gender:'male', dob:'1980-03-03', job:'Dentist'},
			{id:'2', firstName:'Lisa', lastName: "Jones", gender:'female', dob:'1985-02-22', job:'Accountant'},
      {id:'3', firstName: "John", lastName: "Citizen", gender:'male', dob:'1975-12-11', job:'Unemployed'}];
	},
  getHobbiesData: function(uid) {
    var hobbies = [
    {
      id:'1',
      hobbies: [{id:'1', hobby: 'reading'}, {id:'2', hobby: 'golfing'}, {id:'3', hobby: 'cutting code'}]
    },
    {
      id:'2',
      hobbies: [{id:'1', hobby: 'reading'}]
    }, 
    {
      id:'3',
      hobbies: [{id:'1', hobby: 'watching YouTube'}]
    }];
    var personHobbies = hobbies.filter(function(person){
      return person.id === uid;
    });
    return personHobbies[0] ? personHobbies[0].hobbies : [];
  }
};
