var StateManager = require('./stateManager');
var stateMgr;

var mixin = {
  ui: {
    initializeAppContext: function(options, initCtxObj){
      stateMgr = new StateManager(this, options, initCtxObj);
    },
    componentWillUnmount: function(){
      if('sessionStorage' in window){
        window.sessionStorage.clear();
      }
      stateMgr.dispose();
    }
  },
  view: {
    getInitialState: function(){
      //If component isn't passed in just returns appContext
      return {
        appContext: stateMgr.currentState(),
        containerType: "view"
      };
    },
    componentDidMount: function(){
      //If component is passed registers stateChange listener
      stateMgr.mountView(this);
    },
    componentWillUnmount: function(){
      //remove event listener
      stateMgr.unmountView(this);
    }
  },
  display: {
    getInitialState: function(){
      return {
        containerType: "display"
      }
    },
    componentDidMount: function(){
      this.props.appContext.cueDisplay(this);
    }
  },
  page: {
    getInitialState: function(){
      return {
        containerType: "page"
      }
    },
    componentDidMount: function(){
      this.props.appContext.cuePage(this);
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
      path = path.replace(Astarisx.page.base(), '');
      if (Astarisx.page.base() && orig == path ||
        el.href === el.baseURI + el.search + (el.hash || '')) {
          return;
        }

      Astarisx.page.show(orig);
    }
  },
  mediaQuery: {
    mediaQueryWillUpdate: function(id, mql, initializing){
      stateMgr.currentState().mediaQueryWillUpdate.call(stateMgr.currentState(), id, mql, initializing);
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
                mql.addListener(this.mediaQueryWillUpdate.bind(this, id[1]));
                if(initializing){
                  this.mediaQueryWillUpdate(id[1], mql, initializing);
                } else {
                  this.mediaQueryWillUpdate(mql);
                }
              }
            }
          }
        }
      }
    }
  }
};

var display = {
  getInitialState: function(){
    //If component isn't passed in it just returns appContext
    return {
      appContext: stateMgr.currentState(),
      containerType: "display"
    };
  },
  componentDidMount: function(){
    //If component is passed it registers stateChange listener
    stateMgr.mountView(this);
    this.state.appContext.cueDisplay(this);
  },
  componentWillUnmount: function(){
    //remove event listener
    stateMgr.unmountView(this);
  }
};

var page = {
  getInitialState: function(){
    //If component isn't passed in it just returns appContext
    return {
      appContext: stateMgr.currentState(),
      containerType: "page"
    };
  },
  componentDidMount: function(){
    //If component is passed it registers stateChange listener
    stateMgr.mountView(this);
    this.state.appContext.cuePage(this);
  },
  componentWillUnmount: function(){
    //remove event listener
    stateMgr.unmountView(this);
  }
};

var viewMixin = mixin.view;

Object.defineProperty(mixin.view, 'display', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: display
});

Object.defineProperty(mixin.view, 'page', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: page
});

module.exports = mixin;
