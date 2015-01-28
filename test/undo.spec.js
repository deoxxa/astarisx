var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');


//Only initialize persons dataContext
var ControllerViewModel = Astarisx.createCVMClass({
  mixins:[require('../refImpl/mixinViewModels')],
  getInitialState: function(){
    return { staticField: 'initStaticVal' };
  },
  dataContextWillInitialize: function(/* arguments passed in from new StateManager call*/){
    this.initializeDataContext("persons");
  },
  staticField: {
    kind: 'static',
    get: function(){
      return this.$state.staticField;
    }
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  render: function(){
    return React.createElement('div');
  }
});

var app = TU.renderIntoDocument(React.createElement(UI));

describe('undo.spec.js -> enableUndo', function(){
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

  describe('undo/redo functionality with kind:static field', function(){
    it('forget $previousState', function(done){
      expect(app.state.appContext.$previousState).be.undefined();
      app.state.appContext.persons.selectPersonForgetPrevState('1', false, function(err, appContext){
        appContext.$state.$dataContextUpdated.must.have.property('persons');
        appContext.$canRevert.must.be.equal(false);
        appContext.$canAdvance.must.be.equal(false);
        this.setState();
        done();
      });
    });

    it('remember $previousState', function(done){
      expect(app.state.appContext.$previousState).be.undefined();
      app.state.appContext.persons.selectPersonForgetPrevState('1', true, function(err, appContext){
        appContext.$state.$dataContextUpdated.must.have.property('persons');
        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        this.setState();
        done();
      });
    });
    

    it('update selectedPerson 2x and traverse state with kind:static field & $dataContextUpdated', function(done){

      var selectedPerson = app.state.appContext.persons.selectedPerson;
      selectedPerson.fullName.must.be.equal("Frank Smith");
      app.state.appContext.staticField.must.equal("initStaticVal");
      
      selectedPerson.setState({firstName: "Fred"}, function(err, appContext){
        this.setState();
        this.fullName.must.equal("Fred Smith");
        appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Fred');
        appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Smith');
        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        appContext.staticField.must.equal("initStaticVal");
        
        this.setState({lastName: "Flintstone"}, {staticField: 'updated'}, function(err, appContext){
          appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Fred');
          appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Flintstone');
          appContext.$state.$dataContextUpdated.must.have.property('staticField');
          this.setState();

          this.fullName.must.be.equal("Fred Flintstone");
 
          appContext.staticField.must.equal("updated");
          appContext.$canRevert.must.be.equal(true);
          appContext.$canAdvance.must.be.equal(false);

          appContext.revert(function(err, appContext){
            appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Fred');
            appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Smith');
            appContext.persons.selectedPerson.fullName.must.be.equal("Fred Smith");
            appContext.staticField.must.equal("updated");
            appContext.$canRevert.must.be.equal(true);
            appContext.$canAdvance.must.be.equal(true);

            appContext.revert(function(err, appContext){
              appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Frank');
              appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Smith');
              appContext.persons.selectedPerson.fullName.must.be.equal("Frank Smith");
              appContext.staticField.must.equal("updated");
              appContext.$canRevert.must.be.equal(true);
              appContext.$canAdvance.must.be.equal(true);

              appContext.advance(function(err, appContext){
                appContext.persons.selectedPerson.fullName.must.be.equal("Fred Smith");
                appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Fred');
                appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Smith');
                appContext.staticField.must.equal("updated");
                appContext.$canRevert.must.be.equal(true);
                appContext.$canAdvance.must.be.equal(true);

                appContext.advance(function(err, appContext){
                  appContext.persons.selectedPerson.fullName.must.be.equal("Fred Flintstone");
                  appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Fred');
                  appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Flintstone');
                  //This is a static field. should it even be here??
                  appContext.$state.$dataContextUpdated.must.have.property('staticField', 'updated');
                  appContext.staticField.must.equal("updated");
                  appContext.$canRevert.must.be.equal(true);
                  appContext.$canAdvance.must.be.equal(false);
                  appContext.revert(function(err, appContext){

                    //reset fullName to Frank Smith. Tested in next test
                    appContext.revert();
                    app.state.appContext.persons.selectedPerson.fullName.must.be.equal("Frank Smith");
                    app.state.appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('firstName','Frank');
                    app.state.appContext.$state.$dataContextUpdated.persons.selectedPerson.must.have.property('lastName','Smith');
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it('batch update selectedPerson 2x and traverse state with kind:static field', function(done){

      var selectedPerson = app.state.appContext.persons.selectedPerson;
      selectedPerson.fullName.must.be.equal("Frank Smith");
      selectedPerson.setState({firstName: "Fred"}, function(err, appContext){
        this.fullName.must.be.equal("Fred Smith");
        selectedPerson.fullName.must.be.equal("Frank Smith");
        appContext.must.have.ownProperty('$previousState');
        appContext.$previousState.must.be.an.object();
        appContext.$canRevert.must.be.equal(true);
        appContext.$canAdvance.must.be.equal(false);
        this.setState({lastName: "Flintstone"}, {staticField: 'initStaticVal'}, function(err, appContext){
          this.fullName.must.be.equal("Fred Flintstone");
          appContext.must.have.ownProperty('$previousState');
          appContext.$previousState.must.be.an.object();

          appContext.staticField.must.equal("initStaticVal");
          appContext.$canRevert.must.be.equal(true);
          appContext.$canAdvance.must.be.equal(false);

          appContext.revert(function(err, appContext){
            appContext.persons.selectedPerson.fullName.must.be.equal("Frank Smith");
            appContext.must.have.ownProperty('$previousState');
            appContext.$previousState.must.be.an.object();

            appContext.staticField.must.equal("initStaticVal");
            appContext.$canRevert.must.be.equal(true);
            appContext.$canAdvance.must.be.equal(true);

            appContext.advance(function(err, appContext){
              appContext.persons.selectedPerson.fullName.must.be.equal("Fred Flintstone");
              appContext.must.have.ownProperty('$previousState');
              appContext.$previousState.must.be.an.object();
    
              appContext.staticField.must.equal("initStaticVal");
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


