/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
/* Kick of the App*/

//enableUndo is optional - default is false
//if getRoutes() is set in a ViewModel enableUndo defaults to true
React.renderComponent(<ApplicationView
	domainModel={DomainViewModel}/>,
	document.getElementById('container'));
