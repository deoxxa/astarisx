var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');
// var sinon = require('sinon');

// var ControllerViewModel = require('../refImpl/cvm_basic');
// var cvmDescriptor = ControllerViewModel.getDescriptor();
// var personsDescriptor = cvmDescriptor.viewModels.persons.getDescriptor();
// var hobbiesDescriptor = cvmDescriptor.viewModels.hobbies.getDescriptor();

// sinon.spy(cvmDescriptor.originalSpec, "dataContextWillInitialize");
// sinon.spy(personsDescriptor.originalSpec, "dataContextWillInitialize");
// sinon.spy(hobbiesDescriptor.originalSpec, "dataContextWillInitialize");

describe('Basic Initialize - all dataContexts | enableUndo=not set | enableRouting=not set', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')],
      dataContextWillInitialize: function(){
        this.initializeDataContext('*');
      }
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    // stateMgr = new StateManager(component, options, initCtxObj);
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }/*, initCtxObj*/);

  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('App Component state have key appContext', function(){
      app.state.must.have.keys(['appContext']);
    })
    it('appContext must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
    })
    it('appContext must have keys "persons" and "hobbies"', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies']);
    })
    it('persons.collection must contain 3 people', function(){
      app.state.appContext.persons.collection.must.have.length(3);
    })
  });

})

describe('Initialize - no dataContexts | enableUndo=not set | enableRouting=not set', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')]
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    // stateMgr = new StateManager(component, options, initCtxObj);
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }/*, initCtxObj*/);
  })
  after(function(){
    stateMgr.dispose();
  })

  describe('appContext', function(){
    it('App Component state have key appContext', function(){
      app.state.must.have.keys(['appContext']);
    })
    it('appContext must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
    })
    it('appContext must have keys "persons" and "hobbies"', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies']);
    })
    it('persons.collection must contain NO people', function(){
      app.state.appContext.persons.collection.must.have.length(0);
    })

    it('pre calling initializeDataContext: "persons" dataContextWillInitialize exists', function(){
      app.state.appContext.persons.dataContextWillInitialize.must.be.a.function();
    })
    it('post calling initializeDataContext: "persons" dataContextWillInitialize must not exist', function(){
      app.state.appContext.initializeDataContext("persons");
      expect(app.state.appContext.persons.dataContextWillInitialize).be.undefined();
    })
    it('persons collection to be legth 3', function(){
        app.state.appContext.persons.collection.must.have.length(3);
    })
    it('pre calling initializeDataContext: "hobbies" dataContextWillInitialize exists', function(){
      app.state.appContext.hobbies.dataContextWillInitialize.must.be.a.function();
    })
    it('post calling initializeDataContext: "hobbies" dataContextWillInitialize must not exist', function(){
      app.state.appContext.initializeDataContext("hobbies");
      expect(app.state.appContext.hobbies.dataContextWillInitialize).be.undefined();
    })

  });

})

describe('Initialize - all dataContexts | enableUndo=true | enableRouting=not set', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')],
      getInitialState: function(){ //optional
        return {
          online: true,
          busy: false
        };
      },
      dataContextWillInitialize: function(){
        this.initializeDataContext('*');
      },
      personCount: {
        kind:'pseudo',
        get: function(){
          return this.persons ? this.persons.collection.length : 0;
        }
      },
      busy: {
        get: function(){
          return this.$state.busy;
        },
      },
      online: {
        kind: "static",
        get: function(){
          return this.$state.online;
        },
        set: function(newValue){
          this.setState({'online': newValue });
        }
      }
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    // stateMgr = new StateManager(component, options, initCtxObj);
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel,
      enableUndo: true
    }/*, initCtxObj*/);

  })
  after(function(){
    stateMgr.dispose();
  })
  
  describe('appContext', function(){
    it('appContext must have keys "online" & "busy"', function(){
      app.state.appContext.must.have.ownProperty('busy', false);
      app.state.appContext.must.have.ownProperty('online', true);
      app.state.appContext.personCount.must.be.eql(3);
    })
    it('appContext keys & nonenumerables & functions', function(){

      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
      app.state.appContext.must.have.nonenumerable('personCount');
    })
    it('select person 1"', function(){
      app.state.appContext.persons.selectPerson('1');
      app.state.appContext.persons.selectedPerson.must.be.an.object();
      app.state.appContext.persons.selectedPerson.id.must.eql('1');
      app.state.appContext.persons.selectedPerson.firstName.must.eql('Frank');
      app.state.appContext.$canRevert.must.be.true();
      app.state.appContext.$canAdvance.must.be.false();
      app.state.appContext.must.have.nonenumerable('$previousState');
      app.state.appContext.persons.selectedPerson.setState({'firstName' :'Frank1'});
      app.state.appContext.setState({'online': false});
      app.state.appContext.persons.selectedPerson.setState({'firstName' :'Frank12'});
      app.state.appContext.persons.selectedPerson.firstName.must.eql('Frank12');
      app.state.appContext.must.have.ownProperty('online', false);
      app.state.appContext.revert();
      app.state.appContext.must.have.ownProperty('online', false);
      app.state.appContext.persons.selectedPerson.firstName.must.eql('Frank1');
      app.state.appContext.$canAdvance.must.be.true();
      app.state.appContext.$canRevert.must.be.true();
      app.state.appContext.revert();
      app.state.appContext.must.have.ownProperty('online', false);
      app.state.appContext.persons.selectedPerson.firstName.must.eql('Frank');
      app.state.appContext.setState({'online': true});
      app.state.appContext.revert();
      app.state.appContext.must.have.ownProperty('online', true);
      app.state.appContext.$canAdvance.must.be.true();
      app.state.appContext.$canRevert.must.be.false();
      expect(app.state.appContext.persons.selectedPerson).be.undefined();
      app.state.appContext.must.have.nonenumerable('$nextState');
      app.state.appContext.advance();
      app.state.appContext.persons.selectedPerson.must.be.an.object();
      app.state.appContext.persons.selectedPerson.id.must.eql('1');
      app.state.appContext.persons.selectedPerson.firstName.must.eql('Frank');
    })
    it('Add person', function(){
      app.state.appContext.persons.addPerson("Louis Johnson");
      app.state.appContext.personCount.must.be.eql(4);
      app.state.appContext.persons.selectedPerson.must.have.ownProperty("fullName", "Louis Johnson");
      app.state.appContext.revert();
      app.state.appContext.personCount.must.be.eql(3);
      app.state.appContext.advance();
      app.state.appContext.personCount.must.be.eql(4);
      app.state.appContext.persons.selectedPerson.must.have.ownProperty("fullName", "Louis Johnson");
    })
  });

})