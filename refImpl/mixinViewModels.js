//dataContexts

var mixinViewModels = {
  persons: {
    viewModel: require('./personsViewModel'),
    get: function(){
      return this.$state.persons;
    }
  },

  hobbies: {
    viewModel: require('./hobbiesViewModel'),
    get: function(){
      return this.$state.hobbies;
    }
  } 
};

module.exports = mixinViewModels;