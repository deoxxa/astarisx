/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var IMVVM = IMVVM || {};
IMVVM.version = 'IMVVM v.0.0.1';
IMVVM.IMVVMMixin = {
	stateChangedHandler: function(dataContext, callback){
		this.setState({appContext: dataContext}, function(){
			//send all state back to caller
			//useful if you need to know what other parts of the app
			//were impacted by your changes. You can also use the returned
			//information to display things external to your ApplicationModel
			//Allows you to have multiple Application ViewModels in the one app and
			//still share the state with other presentation models that may be interested
			if(typeof callback === 'function'){
				if(this.state !== null && ('appContext' in this.state)){
					callback(this.state.appContext);
				} else {
					callback(void 0);
				}
			}
		}.bind(this));
	},

	getInitialState: function(){
		var appDataContext = IMVVM.Main(IMVVM.version, this.props.viewModel, this.props.initArgs,
			this.props.dataContexts, this.stateChangedHandler, this.props.noUndo);
		return {appContext: appDataContext};
	}

};