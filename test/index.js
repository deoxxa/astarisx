var React          = require('react');
var ReactAddons    = require('react/addons'); // You also need to require the addons
var ReactTestUtils = React.addons.TestUtils;  // <- YEAH!
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');
var stateMgr;

// var initializeAppContext = function(options, initCtxObj){

//   stateMgr = new StateManager(, options, initCtxObj);
//   stateMgr.bind('mockedStateChange', function(appContext) {
//     console.log('appContext => ', appContext);
//   });
// }
var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})

// // console.log('TESTING');
// var page = require('webpage').create();
// page.open('index.html', function() {
//   console.log(' 123');
//   // page.render('example.png');
//   phantom.exit();
// });


// describe("DOM Tests", function () {
//     var el = document.createElement("div");
//     el.id = "myDiv";
//     el.innerHTML = "Hi there!";
//     el.style.background = "#ccc";
//     document.body.appendChild(el);
 
//     var myEl = document.getElementById('myDiv');
//     it("is in the DOM", function () {
//         expect(myEl).to.not.equal(null);
//     });
 
//     it("is a child of the body", function () {
//         expect(myEl.parentElement).to.equal(document.body);
//     });
 
//     it("has the right text", function () {
//         expect(myEl.innerHTML).to.equal("Hi there!");
//     });
 
//     it("has the right background", function () {
//         expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
//     });
// });