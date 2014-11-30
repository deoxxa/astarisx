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

describe('persons dataContext', function(){
  var stateMgr;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    });
  });
  after(function(){
    stateMgr.dispose();
  });

  describe('appContext', function(){
    it('persons.collection must contain 3 people', function(){
      app.state.appContext.persons.collection.must.have.length(3);
    })
  });
});


