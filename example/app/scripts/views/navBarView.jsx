/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var NavBarView = React.createClass({
	toggleMenu: function(e){
		$(this.refs.menu.getDOMNode()).slideToggle();
	},
	undo: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.undo();
	},
	toggleBusyState: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.busy = !this.props.appContext.busy;
	},
	render: function(){
		var busyBtnTxt = this.props.appContext.busy ? "Stop Now" : "Get Busy";

		return (
			<nav className="navbar navbar-default" role="navigation">
			  <div className="container-fluid">
			    <div className="navbar-header">
			      <button onClick={this.toggleMenu} type="button"
			      className="navbar-toggle"
			      data-toggle="collapse"
			      data-target="#bs-example-navbar-collapse-1">
			        <span className="sr-only">Toggle navigation</span>
			        <span className="icon-bar"></span>
			        <span className="icon-bar"></span>
			        <span className="icon-bar"></span>
			      </button>
			      <a className="navbar-brand" href="#">IMVVM Demo Application</a>
			    </div>

			    <div ref="menu" className="collapse navbar-collapse">
			      <form className="navbar-form navbar-left" role="search">
			        <button onClick={this.undo} className="btn btn-default">
			        Undo
			        </button>
			        <button onClick={this.toggleBusyState} className="btn btn-default">
			        	{busyBtnTxt}
			        </button>
			      </form>
			    </div>
			  </div>
			</nav>
		);		
	}		
});