/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
/* Kick of the App*/

//noUndo is optional - default is false
React.renderComponent(<ApplicationView 
	domainModel={DomainViewModel}
  enableUndo={true} />,
	document.getElementById('container'));


