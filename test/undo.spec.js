var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');


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

describe('initialize with enableUndo', function(){
  var stateMgr;
  var model;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel,
      enableUndo: true
    });
    model = app.state.appContext.persons.collection[0];
  });
  after(function(){
    stateMgr.dispose();
  });

  describe('undo/redo functionality', function(){
    it('forget $previousState', function(done){
      expect(app.state.appContext.$previousState).be.undefined();
      app.state.appContext.persons.selectPersonForgetPrevState('1', false, function(err, appContext){
        appContext.$canRevert.must.be.equal(false);
        appContext.$canAdvance.must.be.equal(false);
        this.setState();
        done();
      });
    });

    it('remember $previousState', function(done){
      expect(app.state.appContext.$previousState).be.undefined();
      app.state.appContext.persons.selectPersonForgetPrevState('1', true, function(err, appContext){
        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        this.setState();
        done();
      });
    });
    

    it('update selectedPerson 2x and traverse state', function(done){

      var selectedPerson = app.state.appContext.persons.selectedPerson;
      selectedPerson.fullName.must.be.equal("Frank Smith");

      selectedPerson.setState({firstName: "Fred"}, function(err, appContext){
        this.fullName.must.be.equal("Fred Smith");
        appContext.must.have.ownProperty('$previousState');
        appContext.$previousState.must.be.an.object();

        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        //commit
        this.setState();
        this.setState({lastName: "Flintstone"}, function(err, appContext){
          this.fullName.must.be.equal("Fred Flintstone");
          appContext.$canRevert.must.be.equal(true);
          appContext.$canAdvance.must.be.equal(false);
          appContext.must.have.ownProperty('$previousState');
          appContext.$previousState.must.be.an.object();
          appContext.revert(function(err, appContext){
            appContext.persons.selectedPerson.fullName.must.be.equal("Fred Smith");
            appContext.$canRevert.must.be.equal(true);
            appContext.$canAdvance.must.be.equal(true);
            appContext.revert(function(err, appContext){
              appContext.persons.selectedPerson.fullName.must.be.equal("Frank Smith");
              appContext.$canRevert.must.be.equal(true);
              appContext.$canAdvance.must.be.equal(true);
              appContext.advance(function(err, appContext){
                appContext.persons.selectedPerson.fullName.must.be.equal("Fred Smith");
                appContext.$canRevert.must.be.equal(true);
                appContext.$canAdvance.must.be.equal(true);
                appContext.advance(function(err, appContext){
                  console.log(appContext);
                  appContext.persons.selectedPerson.fullName.must.be.equal("Fred Flintstone");
                  appContext.$canRevert.must.be.equal(true);
                  appContext.$canAdvance.must.be.equal(false);
                  appContext.revert(function(err, appContext){
                    appContext.revert();
                  });
                  done();
                });
              });
            });
          });
        });
      });

    });

    it('batch update selectedPerson 2x and traverse state', function(done){

      var selectedPerson = app.state.appContext.persons.selectedPerson;
      selectedPerson.fullName.must.be.equal("Frank Smith");
      selectedPerson.setState({firstName: "Fred"}, function(err, appContext){
        this.fullName.must.be.equal("Fred Smith");
        appContext.must.have.ownProperty('$previousState');
        appContext.$previousState.must.be.an.object();
        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        this.setState({lastName: "Flintstone"}, function(err, appContext){
          this.fullName.must.be.equal("Fred Flintstone");
          appContext.must.have.ownProperty('$previousState');
          appContext.$previousState.must.be.an.object();
          appContext.$canRevert.must.be.equal(true);
          appContext.$canAdvance.must.be.equal(false);
          
          appContext.revert(function(err, appContext){
            appContext.persons.selectedPerson.fullName.must.be.equal("Frank Smith");
            appContext.must.have.ownProperty('$previousState');
            appContext.$previousState.must.be.an.object();
            appContext.$canRevert.must.be.equal(true);
            appContext.$canAdvance.must.be.equal(true);

            appContext.advance(function(err, appContext){
              appContext.persons.selectedPerson.fullName.must.be.equal("Fred Flintstone");
              appContext.must.have.ownProperty('$previousState');
              appContext.$previousState.must.be.an.object();
              appContext.$canRevert.must.be.equal(true);
              appContext.$canAdvance.must.be.equal(false);
              done();
            });
          });
        });
      });
    });

  });
});


