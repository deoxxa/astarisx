/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.HobbyListView = (function(App){
	var HobbyListView = React.createClass({
		handleSelection: function(uid, e){
			this.props.appContext.hobbies.select(uid);
		},
		addHobby: function(value, e){
			this.props.appContext.hobbies.addHobby(value);
		},
		deleteHobby: function(uid, e){
			this.props.appContext.hobbies.deleteHobby(uid);
		},
		render: function() {
			var app = this.props.appContext;
			var collection = this.props.appContext.hobbies.collectionItems;
			var current = this.props.appContext.hobbies.selected;
			var AddControl = App.InputAddControl;
			var DeleteButton = App.DeleteButtonControl;

			var list = collection.map(function(hobby){
				if(current === hobby){
					return (
						<a 
						onClick={this.handleSelection.bind(this, hobby)}
						key={hobby}
						href="#"
						className="list-group-item active">
						    {hobby}
						    <DeleteButton funcDelete={this.deleteHobby.bind(this, hobby)} />
						</a>
					);
				}
				return (
					<a 
					onClick={this.handleSelection.bind(this, hobby)}
					key={hobby}
					href="#"
					className="list-group-item">
					    {hobby}
					    <DeleteButton funcDelete={this.deleteHobby.bind(this, hobby)} />
					</a>
				);
			}.bind(this));

			return (
				<div>
					<AddControl placeholder="What do you like doing in your spare time?"
						funcAdd={this.addHobby} />
					<div className="list-group">
					  {list}
					</div>
				</div>
			);
		}
	});
	return HobbyListView;
}(MyApp));