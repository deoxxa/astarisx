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
		console.log(this.state.appContext);
		
		return (
			<div>
				<NavBarView appContext={this.state.appContext} />
				<div className="container">
					<div className="row">
						<div className="col-md-4">
							<SideBarView appContext={this.state.appContext} />
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

