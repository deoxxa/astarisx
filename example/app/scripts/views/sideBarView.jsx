/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var SideBarView = React.createClass({
	addPerson: function(value){
		this.props.appContext.persons.addPerson(value);
	},

	render: function(){
		return (
			<div>
				<AddControl placeholder="Full Name" funcAdd={this.addPerson} />
				<ListView appContext={this.props.appContext} />
			</div>
		);		
	}		
});