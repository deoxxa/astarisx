/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
/* Kick of the App*/

//initArgs is Optional - passed to AppViewModel init
React.renderComponent(<ApplicationView 
	viewModel={ApplicationViewModel} 
	initArgs={{appName: 'IMVVM Demo'}}
	dataContexts={dataContexts} />,
	document.getElementById('container'));


