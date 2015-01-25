//mixinFields

var mixinFields = {
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

