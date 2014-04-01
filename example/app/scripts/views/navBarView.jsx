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
	toggleOnlineState: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.online = !this.props.appContext.online;
	},
	render: function(){
		var onlineBtnTxt = this.props.appContext.online ? "Go offline" : "Go online";
		var onlineBtnClass = this.props.appContext.online ? "btn btn-success": "btn btn-danger";
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
			        <button onClick={this.toggleOnlineState} className={onlineBtnClass}>
			        	{onlineBtnTxt}
			        </button>
			      </form>
			    </div>
			  </div>
			</nav>
		);		
	}		
});