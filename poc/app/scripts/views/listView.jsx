/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.ListView = (function(App){
	var ListView = React.createClass({
		handleSelection: function(uid, e){

			console.log('selected');
			console.log(uid);
			console.log(this.props.appContext.persons.select);

			this.props.appContext.persons.select(uid);
		},
		deletePerson: function(uid, e){
			this.props.appContext.persons.deletePerson(uid);
		},
		render: function() {
			var app = this.props.appContext;
			var collection = this.props.appContext.persons.collection;
			var current = this.props.appContext.persons.selected;
			var DeleteButton = App.DeleteButtonControl;

			var list = collection.map(function(person){
				console.log('person');
				console.log(person);
				if(current.id === person.id){
					return (
						<a 
						onClick={this.handleSelection.bind(this, person.id)}
						key={person.id}
						href="#"
						className="list-group-item active">
						    {person.fullName}
						    <DeleteButton funcDelete={this.deletePerson.bind(this, person.id)} />
						</a>
					);
				}
				return (
					<a onClick={this.handleSelection.bind(this, person.id)}
					key={person.id}
					href="#"
					className="list-group-item">
					    {person.fullName}
					    <DeleteButton funcDelete={this.deletePerson.bind(this, person.id)} />
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
}(MyApp));