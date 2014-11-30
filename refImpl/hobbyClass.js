var Astarisx = require('../src/core');

var HobbyClass = Astarisx.createMClass({

  getInitialState: function(){
    return {
      id: this.id || Astarisx.uuid()
    }
  },

  id: {
    kind: 'uid',
    get: function(){
      return this.$state.id;
    }
  },

  name: {
    aliasFor: 'hobby',
    get: function(){
      return this.$state.name;
    },
    set: function(newValue){
      this.setState({'name': newValue });
    }
  },

});

module.exports = HobbyClass;