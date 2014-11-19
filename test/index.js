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

    // sinon.spy(app, "setState");
    // console.log(hobbiesDescriptor.originalSpec.dataContextWillInitialize.callCount);

  })
  after(function(){
    // app.setState.restore();
    // cvmDescriptor.originalSpec.dataContextWillInitialize.restore();
    // personsDescriptor.originalSpec.dataContextWillInitialize.restore();
    // hobbiesDescriptor.originalSpec.dataContextWillInitialize.restore();
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
      mixins:[require('../refImpl/mixinViewModels')],
      // dataContextWillInitialize: function(){
      //   this.initializeDataContext('*');
      // }
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

    // sinon.spy(app, "setState");
    // console.log(hobbiesDescriptor.originalSpec.dataContextWillInitialize.callCount);

  })
  after(function(){
    // app.setState.restore();
    // cvmDescriptor.originalSpec.dataContextWillInitialize.restore();
    // personsDescriptor.originalSpec.dataContextWillInitialize.restore();
    // hobbiesDescriptor.originalSpec.dataContextWillInitialize.restore();
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

  });

})