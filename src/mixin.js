
var core = require('./stateController');
var __NAMESPACE__ = '__IMVVM__';

var mixin = {
	main: {
		stateChangeHandler: function(dataContext){
      this.setState({dataContext: dataContext});
	  },
		getInitialState: function(){
      var dataContext;
      var enableUndo = false;

      if(!('controllerViewModel' in this.props)){
        if('domainModel' in this.props){
          controllerViewModel = this.props.domainModel;
          new TypeError('Please rename the "domainModel" prop in React.renderComponent to "controllerViewModel"');
        }
        new TypeError('Please assign the ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
      }

      if('enableUndo' in this.props){
        enableUndo = this.props.enableUndo;
      }

			dataContext = core.getInitialState(__NAMESPACE__, this.props.controllerViewModel,
				this.stateChangeHandler, enableUndo);

			return {dataContext: dataContext};
		}
	},
	pushState: {
		componentDidMount: function(){
			this.getDOMNode().addEventListener('click', this.onclick);
		},
		componentWillUnmount: function(){
			this.getDOMNode().removeEventListener('click');
		},
		/**
		* Event button.
		*/
		which: function(e) {
			e = e || window.event;
			return null == e.which
				? e.button
				: e.which;
		},
		/**
		* Check if `href` is the same origin.
		*/
		sameOrigin: function(href) {
			var origin = location.protocol + '//' + location.hostname;
			if (location.port) origin += ':' + location.port;
			return 0 == href.indexOf(origin);
		},
		/**
		* Handle "click" events for routing from <a>
		*/
		onclick: function (e) {

			if (1 != this.which(e)) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey) return;
			if (e.defaultPrevented) return;

			// ensure link
			var el = e.target;
			while (el && 'A' != el.nodeName) el = el.parentNode;
			if (!el || 'A' != el.nodeName) return;

			// ensure non-hash for the same path
			var link = el.getAttribute('href');
			if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

			// check target
			if (el.target) return;

			// x-origin
			if (!this.sameOrigin(el.href)) return;

			// rebuild path
			var path = el.pathname + el.search + (el.hash || '');

			// same page
			var orig = path + el.hash;
			e.preventDefault();
			path = path.replace(IMVVM.page.base(), '');
			if (IMVVM.page.base() && orig == path ||
				el.href === el.baseURI + el.search + (el.hash || '')) {
					return;
				}

			IMVVM.page.show(orig);
		}
	},
	mediaQuery: {
		closureFunc: function(id, mql, initializing){
      (function(){
        this.state.dataContext.mediaChangeHandler.call(this.state.dataContext, id, mql, initializing);
      }.bind(this))();
    },
    componentDidMount: function(){
      
      var sheets = document.styleSheets;
      var sheetsLen = sheets.length;
      var initializing = true;
      var rules, rulesLen, mql, id;

      for (var i = 0; i < sheetsLen; i += 1) {
        rules = sheets[i].cssRules;
        rulesLen = rules.length;
        for (var j = 0; j < rulesLen; j += 1) {
          if (rules[j].constructor === CSSMediaRule) {
            if(!!rules[j].cssRules.length){
              id = rules[j].cssRules[0].selectorText.split("#");
              if(id.length === 2 && id[0] === ".media"){
                mql = window.matchMedia(rules[j].media.mediaText);
                mql.addListener(this.closureFunc.bind(this, id[1]));
                if(initializing){
                  this.closureFunc(id[1], mql, initializing);
                } else {
                  this.closureFunc(mql);
                }
              }
            }
          }
        }
      }
    }
	}
};

module.exports = mixin;
