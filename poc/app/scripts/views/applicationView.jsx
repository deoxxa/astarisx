/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var MyApp = MyApp || {};

MyApp.ApplicationView = (function(IMVVM, App){
	var applicationView = React.createClass({
		mixins: [IMVVM.IMVVMMixin],
		
		render: function(){
			console.log('------------------------------------ Current Application State ------------------------------------')
			console.log(this.state.appContext)

			var NavBar = App.NavBarView;
			var Details = App.DetailsView;
			var SideBar = App.SideBarView;

			return (
				<div>
					<NavBar appContext={this.state.appContext} />
					<div className="container">
						<div className="row">
							<div className="col-md-4">
								<SideBar appContext={this.state.appContext} />
							</div>
							<div className="col-md-8">
								<Details appContext={this.state.appContext} />
							</div>
						</div>
					</div>
				</div>
			);		
		}
	});
	return applicationView;
}(IMVVM, MyApp));
