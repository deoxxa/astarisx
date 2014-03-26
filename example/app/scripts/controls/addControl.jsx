/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var AddControl = React.createClass({
	add: function(){
		this.props.funcAdd(this.state.newValue);
		this.setState({
			newValue: ""
		});
	},
	update: function(e){
		this.setState({
			newValue: e.target.value
		});
	},
	getInitialState: function() {
	  return {
	    newValue: "" 
	  };
	},
	render: function(){
		return (
			<div style={{marginBottom:5}} className="input-group">
				<input value={this.state.newValue}
					onChange={this.update}
					type="text" className="form-control" placeholder={this.props.placeholder}/>
				<span className="input-group-btn">
					<button onClick={this.add} className="btn btn-default" type="button">Add</button>
				</span>
			</div>
		);		
	}		
});