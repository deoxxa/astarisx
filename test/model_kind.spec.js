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
    it('model must have nonenumerable client side field _clientField', function(){
      model.must.have.nonenumerable('_clientField');
      expect(model._clientField).be.undefined();
    });
    it('model must have enumerable client side field _clientFieldEnumOverride', function(){
      model.must.have.enumerable('_clientFieldEnumOverride');
    });

    it('model must have enumerable field objectField root level frozen', function(){
      model.must.have.enumerable('objectField');
      var lvl1Obj = model.objectField.lvl1Obj;
      var lvl2Obj = model.objectField.lvl1Obj.lvl2Obj;
      var lvl3Obj = model.objectField.lvl1Obj.lvl2Obj.lvl3Obj;


      Object.isFrozen(model.objectField).must.be.true();
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

    it('model must have enumerable field objectFreezeField first level frozen', function(){
      model.must.have.enumerable('objectFreezeField');
      var lvl1Obj = model.objectFreezeField.lvl1Obj;
      var lvl2Obj = model.objectFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = model.objectFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;


      Object.isFrozen(model.objectFreezeField).must.be.true();
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

    it('model must have enumerable field objectDeepFreezeField all levels frozen', function(){
      model.must.have.enumerable('objectDeepFreezeField');
      var lvl1Obj = model.objectDeepFreezeField.lvl1Obj;
      var lvl2Obj = model.objectDeepFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = model.objectDeepFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;

      Object.isFrozen(model.objectDeepFreezeField).must.be.true();
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

    it('model must have enumerable field arrayField root level frozen', function(){
      model.must.have.enumerable('arrayField');
      var lvl1 = model.arrayField;
      
      Object.isFrozen(model.arrayField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.false();
      Object.isFrozen(lvl1[2]).must.be.false();
    });
    it('model must have enumerable field arrayFreezeField first level frozen', function(){
      model.must.have.enumerable('arrayFreezeField');
      var lvl1 = model.arrayFreezeField;
      
      Object.isFrozen(model.arrayFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
    });
    it('model must have enumerable field arrayDeepFreezeField all levels frozen', function(){
      model.must.have.enumerable('arrayDeepFreezeField');
      var lvl1 = model.arrayDeepFreezeField;
      
      Object.isFrozen(model.arrayDeepFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.true();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.true();

    });
    it('Model uninitializedArray should be initialized', function(){
      model.must.have.enumerable('uninitializedArray');
      model.uninitializedArray.must.be.an.array();
      Object.isFrozen(model.uninitializedArray).must.be.true();
    });
  });
});


