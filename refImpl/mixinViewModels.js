//dataContexts

var mixinViewModels = {
  persons: {
    viewModel: require('./personsViewModel'),
    get: function(){
      return this._state.persons;
    }
  },

  hobbies: {
    viewModel: require('./hobbiesViewModel'),
    get: function(){
      return this._state.hobbies;
    }
  },
};

module.exports = mixinViewModels;