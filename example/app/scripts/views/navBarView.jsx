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
	redo: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.redo();
	},
	toggleOnlineState: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.online = !this.props.appContext.online;
	},
	render: function(){
		var onlineBtnTxt = this.props.appContext.online ? "Go offline" : "Go online";
		var onlineBtnClass = this.props.appContext.online ? "btn btn-success": "btn btn-danger";
		var noOfPeople = this.props.appContext.personCount;
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
			      <a className="navbar-brand" href="#">
			      	IMVVM Demo has {noOfPeople} {noOfPeople === 1 ? "person" : "people"}
			      </a>
			    </div>

			    <div ref="menu" className="collapse navbar-collapse pull-right">
			      <form className="navbar-form navbar-left" role="search">
			        <button onClick={this.undo} disabled={!this.props.appContext.canUndo} className="btn btn-default">
			        Undo
			        </button>
			         <button onClick={this.redo} disabled={!this.props.appContext.canRedo} className="btn btn-default">
			        Redo
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