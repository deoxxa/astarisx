var Astarisx = require('../src/core');

var HobbyClass = Astarisx.createModelClass({ // short form => createMClass()

  getInitialState: function(){
    return {
      id: this.id || Astarisx.uuid()
    }
  },

  id: {
    kind: 'uid',
    get: function(){
      return this._state.id;
    }
  },

  name: {
    aliasFor: 'hobby',
    get: function(){
      return this._state.name;
    },
    set: function(newValue){
      this.setState({'name': newValue });
    }
  },

});

module.exports = HobbyClass;