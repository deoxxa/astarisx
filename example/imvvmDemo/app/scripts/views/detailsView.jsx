/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

MyApp.DetailsView = (function(Utils, App){
	var DetailsView = React.createClass({
		render: function() {
			var FormView = App.FormView;
			var HobbyListView = App.HobbyListView;
			return (
				<div>
					<FormView appContext={this.props.appContext}/>
					<HobbyListView appContext={this.props.appContext}/>
				</div>
			);
		}
	});
	return DetailsView;
}(IMVVM.Utils, MyApp));