/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var MyApp = MyApp || {};

MyApp.SideBarView = (function(IMVVM, App){
	var sideBarView = React.createClass({
		addPerson: function(value){
			this.props.appContext.persons.addPerson(value);
		},

		render: function(){

			var ListView = App.ListView;
			var AddControl = App.InputAddControl;

			return (
				<div>
					<AddControl placeholder="Full Name" funcAdd={this.addPerson} />
					<ListView appContext={this.props.appContext} />
				</div>
			);		
		}		
	});
	return sideBarView;
}(IMVVM, MyApp));