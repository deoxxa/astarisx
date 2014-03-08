/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.ListView = (function(){
	var ListView = React.createClass({
		handleSelection: function(id, e){
			this.props.appContext.persons.select(id);
		},
		render: function() {
			var app = this.props.appContext;
			var collection = this.props.appContext.persons.collection;
			var current = this.props.appContext.persons.selected;

			var list = collection.map(function(person){
				if(current.id === person.id){
					return (
						<a 
						onClick={this.handleSelection.bind(this, person.id)}
						key={person.id}
						href="#"
						className="list-group-item active">
						    {person.fullName}
						</a>
					);
				}
				return (
					<a onClick={this.handleSelection.bind(this, person.id)}
					key={person.id}
					href="#"
					className="list-group-item">
					    {person.fullName}
					</a>
				);
			}.bind(this));

			return (
				<div className="list-group">
				  {list}
				</div>
			);
		}
	});
	return ListView;
}());