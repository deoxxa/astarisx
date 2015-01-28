var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');
var sinon = require('sinon');

require('../lib/custom-event-polyfill');

var ControllerViewModel = Astarisx.createControllerViewModelClass({
  mixins:[require('../refImpl/mixinViewModels')],
  getInitialState: function(){
    return {
      busy: false,
    };
  },
  busy: {
    get: function(){
      return this.$state.busy;
    },
  }
});

var AView2 = React.createClass({
  mixins: [Astarisx.mixin.view],
  render: function(){
    return React.createElement('div', {className:"aview2 component"});
  }
});

var AView = React.createClass({
  mixins: [Astarisx.mixin.view],
  render: function(){
    return React.createElement('div', {className:"aview component"});
  }
});

var UI = React.createClass({
  mixins: [Astarisx.mixin.ui],
  getInitialState: function(){
    return { visible: true };
  },
  hide: function(){
    this.setState({visible: false});
  },
  show: function(){
    this.setState({visible: true});
  },
  componentWillMount: function(){
    this.initializeAppContext({
      controllerViewModel: ControllerViewModel
    });
  },
  render: function(){
    var display;
    if(this.state.visible){
      display = (React.createElement('div', null, 
          React.createElement(AView, {$viewKey: "aviewKey"}),
          React.createElement(AView2, {$viewKey: "aviewKey2"}),
          React.createElement('button', {onClick: this.hide})
        )
      );
    } else {
      display = (React.createElement('div', null, 
          React.createElement(AView, {$viewKey: "aviewKey"}),
          React.createElement('button', {onClick: this.show})
        )
      );
    }
    return display;
  }
});

describe('UI', function(){
    
    it("renders UI Components with appContext", function() {
      var app = TU.renderIntoDocument(React.createElement(UI));
      var viewComponent = TU.findRenderedComponentWithType(
        app, AView);
      var viewComponent2 = TU.findRenderedComponentWithType(
        app, AView2);
      
      viewComponent.state.containerType.must.be.equal("view");
      viewComponent.props.$viewKey.must.be.equal("aviewKey");
      viewComponent.state.appContext.must.be.an.object();
      viewComponent2.state.containerType.must.be.equal("view");
      viewComponent2.props.$viewKey.must.be.equal("aviewKey2");
      viewComponent2.state.appContext.must.be.an.object();
      React.unmountComponentAtNode(app.getDOMNode().parentElement);

    });

    it('$notify UI container only', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: "*"});
      
      app.render.calledOnce.must.be.true();
      comp.render.callCount.must.equal(0);
      comp2.render.callCount.must.equal(0);
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });

    it('$notify "aviewKey" only', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: "aviewKey"});
      comp.render.calledOnce.must.be.true();
      app.render.callCount.must.equal(0);
      comp2.render.callCount.must.equal(0);
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });

    it('$notify array "aviewKey" only', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: ["aviewKey"]});
      comp.render.calledOnce.must.be.true();
      app.render.callCount.must.equal(0);
      comp2.render.callCount.must.equal(0);
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });
    
    it('$notify array "*" only', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: ["*"]});
      comp.render.callCount.must.equal(0);
      app.render.calledOnce.must.be.true();
      comp2.render.callCount.must.equal(0);
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });

    it('$notify no views', function(){

      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);

      //already rendered once. Starting trace now.
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      app.state.appContext.setState({busy: true, $notify: []});
      comp.render.callCount.must.equal(0);
      app.render.callCount.must.equal(0);
      comp2.render.callCount.must.equal(0);
      
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();
      comp2.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);
    });
    
    it("unmount AView2 Component and $notify", function() {
      var app = TU.renderIntoDocument(React.createElement(UI));
      var comp = TU.findRenderedComponentWithType(app, AView);
      var comp2 = TU.findRenderedComponentWithType(app, AView2);
      var compArr = TU.scryRenderedDOMComponentsWithClass(app, "component");
      var button = TU.findRenderedDOMComponentWithTag(
        app, 'button').getDOMNode();

      compArr.must.have.length(2);

      //Will invoke a render of UI
      TU.Simulate.click(button);
      
      //comp2 unmounts start trace
      
      sinon.spy(app, "render");
      sinon.spy(comp, "render");
      sinon.spy(comp2, "render");

      compArr = TU.scryRenderedDOMComponentsWithClass(app, "component");
      compArr.must.have.length(1);

      app.state.appContext.setState({busy: true, $notify: ["aviewKey2"]});
      
      comp2.render.callCount.must.equal(0);
      comp.render.callCount.must.equal(0);
      app.render.callCount.must.equal(0);
      
      comp2.state.appContext.busy.must.be.false();
      app.state.appContext.busy.must.be.true();
      comp.state.appContext.busy.must.be.true();

      app.render.restore();
      comp.render.restore();
      comp2.render.restore();

      React.unmountComponentAtNode(app.getDOMNode().parentElement);

    });

});