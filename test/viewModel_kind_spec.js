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
  var viewModel;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    });
    viewModel = app.state.appContext.persons;
  });
  after(function(){
    stateMgr.dispose();
  });
  describe('persons context', function(){
    
    it('viewModel must have enumerable field objectField root level frozen', function(){
      viewModel.must.have.enumerable('objectField');
      var lvl1Obj = viewModel.objectField.lvl1Obj;
      var lvl2Obj = viewModel.objectField.lvl1Obj.lvl2Obj;
      var lvl3Obj = viewModel.objectField.lvl1Obj.lvl2Obj.lvl3Obj;


      Object.isFrozen(viewModel.objectField).must.be.true();
      Object.isFrozen(lvl1Obj).must.be.false();
      Object.isFrozen(lvl2Obj).must.be.false();
      Object.isFrozen(lvl3Obj).must.be.false();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[0]).must.be.false();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[0]).must.be.false();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[0]).must.be.false();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[1]).must.be.false();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[1]).must.be.false();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[1]).must.be.false();
    });

    it('viewModel must have enumerable field objectFreezeField first level frozen', function(){
      viewModel.must.have.enumerable('objectFreezeField');
      var lvl1Obj = viewModel.objectFreezeField.lvl1Obj;
      var lvl2Obj = viewModel.objectFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = viewModel.objectFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;


      Object.isFrozen(viewModel.objectFreezeField).must.be.true();
      Object.isFrozen(lvl1Obj).must.be.true();
      Object.isFrozen(lvl2Obj).must.be.false();
      Object.isFrozen(lvl3Obj).must.be.false();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[0]).must.be.false();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[0]).must.be.false();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[0]).must.be.false();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[1]).must.be.false();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[1]).must.be.false();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[1]).must.be.false();

    });

    it('viewModel must have enumerable field objectDeepFreezeField all levels frozen', function(){
      viewModel.must.have.enumerable('objectDeepFreezeField');
      var lvl1Obj = viewModel.objectDeepFreezeField.lvl1Obj;
      var lvl2Obj = viewModel.objectDeepFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = viewModel.objectDeepFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;

      Object.isFrozen(viewModel.objectDeepFreezeField).must.be.true();
      Object.isFrozen(lvl1Obj).must.be.true();
      Object.isFrozen(lvl2Obj).must.be.true();
      Object.isFrozen(lvl3Obj).must.be.true();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[0]).must.be.true();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[0]).must.be.true();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[0]).must.be.true();
      Object.isFrozen(lvl1Obj.lvl1ArrKey[1]).must.be.true();
      Object.isFrozen(lvl2Obj.lvl2ArrKey[1]).must.be.true();
      Object.isFrozen(lvl3Obj.lvl3ArrKey[1]).must.be.true();
    });

    it('viewModel must have enumerable field arrayField root level frozen', function(){
      viewModel.must.have.enumerable('arrayField');
      var lvl1 = viewModel.arrayField;
      
      Object.isFrozen(viewModel.arrayField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.false();
      Object.isFrozen(lvl1[2]).must.be.false();
    });
    it('viewModel must have enumerable field arrayFreezeField first level frozen', function(){
      viewModel.must.have.enumerable('arrayFreezeField');
      var lvl1 = viewModel.arrayFreezeField;
      
      Object.isFrozen(viewModel.arrayFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
    });
    it('viewModel must have enumerable field arrayDeepFreezeField all levels frozen', function(){
      viewModel.must.have.enumerable('arrayDeepFreezeField');
      var lvl1 = viewModel.arrayDeepFreezeField;
      
      Object.isFrozen(viewModel.arrayDeepFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.true();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.true();

    });

  });
});