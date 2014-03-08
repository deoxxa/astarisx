/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var IMVVM = IMVVM || {};

IMVVM.IMVVMMixin = {
	stateChangedHandler: function(dataContext, callback){
		this.setState({appContext: dataContext}, function(){
			//send all state back to caller
			//useful if you need to know what other parts of the app
			//were impacted by your changes. You can also use the returned
			//information to display things external to your ApplicationModel
			//Allows you to have multiple Application ViewModels in the one app and
			//still share the state with other presentation models that may be interested
			if(!!callback){
				//Need to check this out
				if('appContext' in this.state){
					callback(this.state.appContext);
				} else {
					callback(void 0);
				}
			}
		}.bind(this));
	},

	getInitialState: function(){
		var appDataContext = IMVVM.Main('IMVVM Ver 0.0.1', this.props.viewModel,
			this.props.dataContexts, this.stateChangedHandler, this.props.initArgs);
		return {appContext: appDataContext};
	}
};