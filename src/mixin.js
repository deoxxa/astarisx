
var core = require('./core');
var NAMESPACE = '__IMVVM__';

var mixin = {
	main: {
		stateChangedHandler: function(dataContext){
	  	this.setState({domainDataContext: dataContext});
	  },
		getInitialState: function(){
			var dataContext = core.getInitialState(NAMESPACE, this.props.domainModel,
				this.stateChangedHandler, this.props.enableUndo);
			return {domainDataContext: dataContext};
		}
	},
	pushState: {
		componentDidMount: function(){
			if('path' in this.state.domainDataContext){
				$(this.getDOMNode()).click(this.onclick);
			}
		},
		componentWillUnmount: function(){
			$(this.getDOMNode()).unbind('click');
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
	}
};

module.exports = mixin;
