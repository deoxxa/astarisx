var Astarisx = require('../src/core');

var Contact = Astarisx.createModelClass({

  getInitialState: function(){
    return {
      name: this.name || "",
      number: this.number || "",
      email: this.email || ""
    };
  },

  name: {
    get: function(){
      return this.$state.name;
    },
    set: function(newVal){
      this.setState({name: newVal});
    }
  },
  number: {
    get: function(){
      return this.$state.number;
    },
    set: function(newVal){
      this.setState({number: newVal});
    }
  },
  email: {
    get: function(){
      return this.$state.email;
    },
    set: function(newVal){
      this.setState({email: newVal});
    }
  }
});

module.exports = Contact;