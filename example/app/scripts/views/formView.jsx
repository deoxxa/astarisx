/** 
 * @jsx React.DOM 
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var FormView = React.createClass({
	updateName: function(e){
		this.props.appContext.persons.selected.fullName = e.target.value;
	},
	updateOccupation: function(e){
		this.props.appContext.persons.selected.occupation = e.target.value;
	},
	updateGender: function(e){
		this.props.appContext.persons.selected.gender = e.target.value;
	},
	updateDOB: function(e){
		this.props.appContext.persons.selected.dob = e.target.value;
	},
	render: function() {
		var current = this.props.appContext.persons.selected;

		return (
			<div key={current.id}>
				<form className="form-horizontal" role="form">
					<div className="form-group">
					    <label className="col-md-2 control-label">Name</label>
					    <div className="col-md-3">
						    <input className="form-control" type="text" value={current.fullName}
						    onChange={this.updateName} />
						</div>
					</div>
					<div className="form-group">
					    <label className="col-md-2 control-label">Occupation</label>
					    <div className="col-md-3">
						    <input className="form-control" type="text" value={current.occupation}
						    onChange={this.updateOccupation} />
						</div>
					</div>
					<div className="form-group">
					    <label className="col-md-2 control-label">Gender</label>
					    <div className="col-md-3">
					    	<div className="radio">
								<label>
									<input type="radio" onChange={this.updateGender} value="male" checked={current.gender === 'male'} />
									Male
								</label>
							</div>
							<div className="radio">
								<label>
									<input type="radio" onChange={this.updateGender} value="female" checked={current.gender === 'female'} />
									Female
								</label>
							</div>
						</div>
					</div>
					<div className="form-group">
					    <label className="col-md-2 control-label">Birthday</label>
					    <div className="col-md-3">
						    <input className="form-control" type="text" 
						    placeholder="yyyy-mm-dd"
						    value={current.dob}
						    onChange={this.updateDOB} />
						</div>
					</div>
					<div className="form-group">
					    <label className="col-md-2 control-label">Age</label>
					    <div className="col-md-3">
					    	<div style={{marginTop:7}}>
						    	{current.age}
						    </div>
						</div>
					</div>
				</form>
			</div>
		);
	}
});