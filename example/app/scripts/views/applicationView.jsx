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
    console.log(this.state.domainDataContext);

    /*console.log(Object.isFrozen(this.state.domainDataContext.previousState || {}));
    console.log(Object.isFrozen(this.state.domainDataContext));
    console.log(Object.isFrozen(this.state.domainDataContext.state));
    console.log(Object.isFrozen(this.state.domainDataContext.persons));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.collection));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.selected));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.selected.hobbies));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.state));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.state.collection));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.state.collection[1]));
    console.log(Object.isFrozen(this.state.domainDataContext.persons.state.collection[1].hobbies));
    console.log(Object.isFrozen(this.state.domainDataContext.hobbies.state._selectedPerson));
    console.log(Object.isFrozen(this.state.domainDataContext.hobbies.state._selectedPerson.hobbies));*/
    return (
      <div>
        <NavBarView appContext={this.state.domainDataContext} />
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <SideBarView appContext={this.state.domainDataContext} />
            </div>
            <div className="col-md-8">
              <DetailsView appContext={this.state.domainDataContext} />
            </div>
          </div>
        </div>
      </div>
    );    
  }
});