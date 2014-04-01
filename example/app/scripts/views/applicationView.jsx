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

    /*console.log(Object.isFrozen(this.state.applicationDataContext.previousState || {}));
    console.log(Object.isFrozen(this.state.applicationDataContext));
    console.log(Object.isFrozen(this.state.applicationDataContext.state));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.collection));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.selected));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.selected.hobbies));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.state));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.state.collection));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.state.collection[1]));
    console.log(Object.isFrozen(this.state.applicationDataContext.persons.state.collection[1].hobbies));
    console.log(Object.isFrozen(this.state.applicationDataContext.hobbies.state._selectedPerson));*/
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