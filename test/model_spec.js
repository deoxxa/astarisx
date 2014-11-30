var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');

var calculateAge = function(dob){ // dob is a date
  if(dob.length < 10){
    return 'Enter your Birthday';
  }
  var DOB = new Date(dob);
  var ageDate = new Date(Date.now() - DOB.getTime()); // miliseconds from
  var age = Math.abs(ageDate.getFullYear() - 1970);
  return isNaN(age) ? 'Enter your Birthday' : age + ' years old';
};

//Only initialize persons dataContext
var ControllerViewModel = Astarisx.createCVMClass({
  mixins:[require('../refImpl/mixinViewModels')],
  dataContextWillInitialize: function(/* arguments passed in from new StateManager call*/){
    this.initializeDataContext("persons");
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  render: function(){
    return React.createElement('div');
  }
});

var app = TU.renderIntoDocument(React.createElement(UI));

describe('persons dataContext', function(){
  var stateMgr;
  var model;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    });
    model = app.state.appContext.persons.collection[0];
  });
  after(function(){
    stateMgr.dispose();
  });
  describe('persons context', function(){
    it('model must be frozen', function(){
      Object.isFrozen(model).must.be.true();
    });
    it('model $state must be frozen', function(){
      Object.isFrozen(model.$state).must.be.true();
    });    
    it('check existence of keys and init values of enumerable fields', function(){
      model.must.have.enumerable('id');
      model.must.have.enumerable('firstName');
      model.must.have.enumerable('lastName');
      //this also tests 'aliasFor' job
      model.must.have.enumerable('occupation');
      model.must.have.enumerable('dob');
      model.must.have.enumerable('gender');
      model.must.have.enumerable('hobbies');

      model.must.have.ownProperty('id', '1');
      model.must.have.ownProperty('firstName', 'Frank');
      model.must.have.ownProperty('lastName', 'Smith');
      //this also tests 'aliasFor' job
      model.must.have.ownProperty('occupation', 'Dentist');
      model.must.have.ownProperty('dob', '1980-03-03');
      model.must.have.ownProperty('gender', 'male');
      model.hobbies.must.be.an.array();
      model.hobbies.must.have.length(3);

    });
    it('validation prop $allValid === true', function(){
      model.must.have.ownProperty('$allValid', true);
    });
    it('validation prop $firstNameValid === true', function(){
      model.must.have.ownProperty('$firstNameValid', true);
    });
    it('validation prop $lastNameValid === true', function(){
      model.must.have.ownProperty('$lastNameValid', true);
    });
    it('$dirty must be false', function(){
      model.must.have.ownProperty('$dirty', false);
    });
    it('calculated field "age" must equal the calculated age', function(){
      model.must.have.nonenumerable('age');
      model.age.must.equal(calculateAge(model.dob));
    });
    it('check existence of pseudo keys', function(){
      model.must.have.nonenumerable('fullName');
      model.must.have.ownProperty('fullName', 'Frank Smith');
    });
    it('model must not have setState', function(){
      expect(model.setState).be.undefined();
    });

    it('model is kind:"instance" and must have setState', function(done){
      app.state.appContext.persons.selectPerson('1', function(err, appContext){
        appContext.persons.selectedPerson.id.must.equal('1');
        appContext.persons.selectedPerson.setState.must.be.a.function();
        done();
      });
    });
  });
});


