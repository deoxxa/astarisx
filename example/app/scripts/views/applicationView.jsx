/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var ApplicationView = React.createClass({
	mixins: [IMVVM.mixin],
	
	render: function(){

		console.log('------------------------------------------ Current Application State ------------------------------------------')
		console.log(this.state.applicationDataContext);
		
		return (
			<div>
				<NavBarView appContext={this.state.applicationDataContext} />
				<div className="container">
					<div className="row">
						<div className="col-md-4">
							<SideBarView appContext={this.state.applicationDataContext} />
						</div>
						<div className="col-md-8">
							<DetailsView appContext={this.state.applicationDataContext} />
						</div>
					</div>
				</div>
			</div>
		);		
	}
});

