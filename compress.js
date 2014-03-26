var compressor = require('yuicompressor');

var fs = require('fs');


compressor.compress('./dist/imvvm.js', {
    //Compressor Options:
    charset: 'utf8',
    type: 'js',
    
    //nomunge: true,
    //'line-break': 80
}, function(err, data, extra) {
  fs.writeFile("./dist/imvvm.min.js", data, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  });
    //err   If compressor encounters an error, it's stderr will be here
    //data  The compressed string, you write it out where you want it
    //extra The stderr (warnings are printed here in case you want to echo them
});