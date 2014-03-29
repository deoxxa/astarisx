
var core = require('./core');
var NAMESPACE = '__IMVVM__';

var mixin = {
	stateChangedHandler: function(dataContext, caller, callback){
  	this.setState({appContext: dataContext}, function(){
	    //send all state back to caller
	    //useful if you need to know what other parts of the app
	    //were impacted by your changes. You can also use the returned
	    //information to display things external to your ApplicationModel
	    //Allows you to have multiple Application ViewModels in the one app and
	    //still share the state with other presentation models that may be interested
	    if(typeof callback === 'function'){
      	if(this.state === null || !('appContext' in this.state)){
          callback(void(0));
        } else {
					if(caller in this.state.appContext){
					  callback(this.state.appContext[caller]);
					} else if(caller === NAMESPACE) {
					  callback(this.state.appContext);
					} else {
					  callback(void(0));
					}
				}
			}
		}.bind(this));
  },

	getInitialState: function(){
		var appDataContext = core.getInitialState(NAMESPACE, this.props.domainModel, this.props.initArgs,
			this.props.domain, this.stateChangedHandler, this.props.disableUndo);
		return {appContext: appDataContext};
	}

};

module.exports = mixin;