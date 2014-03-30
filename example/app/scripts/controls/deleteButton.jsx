/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var DeleteButton = React.createClass({
	delete: function(e){
		e.stopPropagation();
		this.props.funcDelete(e);
	},
	render: function(){
		return (
			<span onClick={this.delete} className="glyphicon glyphicon-trash pull-right"></span>
		);		
	}		
});