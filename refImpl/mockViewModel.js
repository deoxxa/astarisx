var Astarisx = require('../src/core');

var MockViewModel = Astarisx.createVMClass({
  dataContextWillInitialize: function(){
    this.setState({initialized: true, passedInArgs: Array.prototype.slice.call(arguments, 0)});
  },

  initialized: {
    get: function(){
      return this.$state.initialized;
    }
  },

  passedInArgs: {
    kind: 'array',
    get: function(){
      return this.$state.passedInArgs;
    }
  }
});
module.exports = MockViewModel;
