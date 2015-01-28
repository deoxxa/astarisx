//mixinFields

var mixinFields = {
  getWatchedState: function() {
    return {
      'hobbies': {
        alias: 'hobbiesContext',
      },
      'online': {
        alias: 'imOnline'
      }
    };
  },
  addPerson: function(value){
    
  },
  dummyProp: {
    set: function(newValue){
      this.setState({dummyProp: newValue});
    }
  },
  dummyPropVal: {
    kind: 'pseudo',
    get: function(){
      return this.$state.dummyProp;
    }
  }
};

module.exports = mixinFields;

