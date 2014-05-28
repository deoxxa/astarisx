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
		this.props.appContext.revert();
	},
	redo: function(e){
		e.preventDefault();
		e.stopPropagation();
		this.props.appContext.advance();
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

			    <div ref="menu" className="collapse navbar-collapse">
            <ul className="nav navbar-nav">
              <li><a href="/broken/link">Bad Link</a></li>
              <li><a href="/person/3">John Citizen</a></li>
            </ul>
			      <form className="navbar-form pull-right" role="search">
			        <button onClick={this.undo} disabled={!this.props.appContext.canRevert} className="btn btn-default">
			        Undo
			        </button>
			         <button onClick={this.redo} disabled={!this.props.appContext.canAdvance} className="btn btn-default">
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
