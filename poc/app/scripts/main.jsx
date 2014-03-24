/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

/* Kick of the App*/
(function(App){

	var ApplicationView = App.ApplicationView;
  //initArgs is Optional - passed to AppViewModel init
	React.renderComponent(<ApplicationView 
		viewModel={App.ApplicationViewModel} 
		initArgs={{appName: 'IMVVM Demo'}}
		dataContexts={App.DataContexts} />,
		document.getElementById('container'));

}(MyApp));
