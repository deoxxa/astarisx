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
			console.log('Current Application State')
			console.log(this.state.appContext)

			var DetailsView = App.DetailsView;
			var ListView = App.ListView;

			return (
				<div>
					<nav className="navbar navbar-default navbar-static-top" role="navigation">
					  <div className="container">
					    Menu
					  </div>
					</nav>
					<div className="container">
						<div className="row">
							<div className="col-md-4">
								<div className="input-group">
									<input type="text" className="form-control" placeholder="Name"/>
									<span className="input-group-btn">
										<button className="btn btn-default" type="button">Add</button>
									</span>
								</div>
								<ListView appContext={this.state.appContext} />
							</div>
							<div className="col-md-8">
								<DetailsView appContext={this.state.appContext} />
							</div>
						</div>
					</div>
				</div>
			);		
		}
	});
	return applicationView;
}(IMVVM, MyApp));
