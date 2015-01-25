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
  },
  getInitialState: function(){
    return {
      objectField: {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                },
    objectFreezeField: {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                },
    objectDeepFreezeField: {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                },
    arrayField: ["aValue1", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }, ["aValue2", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }]],
    arrayFreezeField: ["aValue1", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }, ["aValue2", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }]],
    arrayDeepFreezeField: ["aValue1", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }, ["aValue2", {'rootKey': 'rootVal',
                  'lvl1Obj':{
                    'lvl1ObjKey': 'lvl1ObjVal',
                    'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                    'lvl2Obj':{
                      'lvl2ObjKey': 'lvl2ObjVal',
                      'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl3Obj':{
                        'lvl3ObjKey': 'lvl3ObjVal',
                        'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                      }
                    }
                  }
                }]]
      };
  },
  objectField: {
    kind: 'object',
    get: function(){
      return this.$state.objectField;
    }
  },
  objectFreezeField: {
    kind: 'object:freeze',
    get: function(){
      return this.$state.objectFreezeField;
    }
  },
  objectDeepFreezeField: {
    kind: 'object:deepFreeze',
    get: function(){
      return this.$state.objectDeepFreezeField;
    }
  },

  arrayField: {
    kind: 'array',
    get: function(){
      return this.$state.arrayField;
    }
  },
  arrayFreezeField: {
    kind: 'array:freeze',
    get: function(){
      return this.$state.arrayFreezeField;
    }
  },
  arrayDeepFreezeField: {
    kind: 'array:deepFreeze',
    get: function(){
      return this.$state.arrayDeepFreezeField;
    }
  },

  pseudoField: {
    kind: 'pseudo',
    get: function(){
      return 'pseudoField';
    }
  },

  // invalidKind: {
  //   kind: 'invalid',
  //   get: function(){
  //     return 'invalidKind';
  //   }
  // }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  render: function(){
    return React.createElement('div');
  }
});

var app = TU.renderIntoDocument(React.createElement(UI));

describe('Application dataContext', function(){
  var stateMgr;
  var CVM;
  before(function() {
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    });
    CVM = app.state.appContext;
  });
  after(function(){
    stateMgr.dispose();
  });
  describe('CVM context', function(){
    
    it('CVM must have enumerable field objectField root level frozen', function(){
      CVM.must.have.enumerable('objectField');
      var lvl1Obj = CVM.objectField.lvl1Obj;
      var lvl2Obj = CVM.objectField.lvl1Obj.lvl2Obj;
      var lvl3Obj = CVM.objectField.lvl1Obj.lvl2Obj.lvl3Obj;

      Object.isFrozen(CVM.objectField).must.be.true();
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

    it('CVM must have enumerable field objectFreezeField first level frozen', function(){
      CVM.must.have.enumerable('objectFreezeField');
      var lvl1Obj = CVM.objectFreezeField.lvl1Obj;
      var lvl2Obj = CVM.objectFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = CVM.objectFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;

      Object.isFrozen(CVM.objectFreezeField).must.be.true();
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

    it('CVM must have enumerable field objectDeepFreezeField all levels frozen', function(){
      CVM.must.have.enumerable('objectDeepFreezeField');
      var lvl1Obj = CVM.objectDeepFreezeField.lvl1Obj;
      var lvl2Obj = CVM.objectDeepFreezeField.lvl1Obj.lvl2Obj;
      var lvl3Obj = CVM.objectDeepFreezeField.lvl1Obj.lvl2Obj.lvl3Obj;

      Object.isFrozen(CVM.objectDeepFreezeField).must.be.true();
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

    it('CVM must have enumerable field arrayField root level frozen', function(){
      CVM.must.have.enumerable('arrayField');
      var lvl1 = CVM.arrayField;
      
      Object.isFrozen(CVM.arrayField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.false();
      Object.isFrozen(lvl1[2]).must.be.false();
    });
    it('CVM must have enumerable field arrayFreezeField first level frozen', function(){
      CVM.must.have.enumerable('arrayFreezeField');
      var lvl1 = CVM.arrayFreezeField;
      
      Object.isFrozen(CVM.arrayFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.false();
    });
    it('CVM must have enumerable field arrayDeepFreezeField all levels frozen', function(){
      CVM.must.have.enumerable('arrayDeepFreezeField');
      var lvl1 = CVM.arrayDeepFreezeField;
      
      Object.isFrozen(CVM.arrayDeepFreezeField).must.be.true();
      Object.isFrozen(lvl1[1]).must.be.true();
      Object.isFrozen(lvl1[2]).must.be.true();
      Object.isFrozen(lvl1[1].lvl1Obj.lvl1ArrKey[0]).must.be.true();
      Object.isFrozen(lvl1[2][1].lvl1Obj.lvl1ArrKey[0]).must.be.true();

    });

  });
});