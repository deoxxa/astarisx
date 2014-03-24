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
	//All Props required
	var ApplicationView = App.ApplicationView;

	React.renderComponent(<ApplicationView 
		viewModel={App.ApplicationViewModel} 
		initArgs={{appName: 'IMVVM Demo'}}//Can be array, objects or whatever
		dataContexts={App.DataContexts} />,
		document.getElementById('container'));

}(MyApp));
