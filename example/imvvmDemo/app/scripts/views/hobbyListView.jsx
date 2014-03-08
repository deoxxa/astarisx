/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.HobbyListView = (function(Utils){
	var HobbyListView = React.createClass({
		handleSelection: function(id, e){
			this.props.appContext.hobbies.select(id);
		},
		addHobby: function(){
			this.props.appContext.hobbies.addHobby();
		},
		render: function() {
			var app = this.props.appContext;
			var collection = this.props.appContext.hobbies.collectionItems;
			var current = this.props.appContext.hobbies.selected;

			var list = collection.map(function(hobby){
				if(current === hobby){
					return (
						<a 
						onClick={this.handleSelection.bind(this, hobby)}
						key={hobby}
						href="#"
						className="list-group-item active">
						    {hobby}
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
					</a>
				);
			}.bind(this));

			return (
				<div>
					<button onClick={this.addHobby} type="button" className="btn btn-primary">Add</button>
					<div className="list-group">
					  {list}
					</div>
				</div>
			);
		}
	});
	return HobbyListView;
}(IMVVM.Utils));