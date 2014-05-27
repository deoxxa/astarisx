/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var DetailsView = React.createClass({
	render: function() {
		if(!this.props.appContext.persons.selectedPerson){
			return <div>Select or add a person</div>;
		}
		return (
			<div>
				<FormView appContext={this.props.appContext}/>
				<HobbyListView appContext={this.props.appContext}/>
			</div>
		);
	}
});
