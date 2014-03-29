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
//noUndo is optional - default is false
React.renderComponent(<ApplicationView 
	domainModel={DomainModel}
	initArgs={{appName: 'IMVVM Demo'}}
	domain={domainObjects}
  disableUndo={true} />,
	document.getElementById('container'));


