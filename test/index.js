var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var should = require('should');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');
var sinon = require('sinon');

// var ControllerViewModel = require('../refImpl/cvm_basic');
// var cvmDescriptor = ControllerViewModel.getDescriptor();
// var personsDescriptor = cvmDescriptor.viewModels.persons.getDescriptor();
// var hobbiesDescriptor = cvmDescriptor.viewModels.hobbies.getDescriptor();

// sinon.spy(cvmDescriptor.originalSpec, "dataContextWillInitialize");
// sinon.spy(personsDescriptor.originalSpec, "dataContextWillInitialize");
// sinon.spy(hobbiesDescriptor.originalSpec, "dataContextWillInitialize");

describe('Basic Initialization', function(){
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

    sinon.spy(app, "setState");
    // console.log(hobbiesDescriptor.originalSpec.dataContextWillInitialize.callCount);

  })
  after(function(){
    app.setState.restore();
    // cvmDescriptor.originalSpec.dataContextWillInitialize.restore();
    // personsDescriptor.originalSpec.dataContextWillInitialize.restore();
    // hobbiesDescriptor.originalSpec.dataContextWillInitialize.restore();
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('expect App Component state to contain appContext', function(){
      app.state.should.have.keys('appContext');
    })
    it('appContext should contain "persons" and "hobbies" data Context', function(){
      app.state.appContext.should.have.keys('persons', 'hobbies');
    })
    it('persons.collection should contain 3 people', function(){
      app.state.appContext.persons.collection.should.have.a.lengthOf(3);
    })
    // it('this.initializeDataContext('*');', function(){
    //   app.state.appContext.initializeDataContext('hobbies');
    //   hobbiesDescriptor.originalSpec.dataContextWillInitialize.callCount.should.equal(2);
    //   //this.initializeDataContext('*');
    // })
  });
})