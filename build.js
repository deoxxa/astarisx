var fs = require('fs');
var path = require('path');

var compressor = require('yuicompressor');
var browserify = require('browserify');
var b = browserify();
var writer = fs.createWriteStream(path.normalize('dist/imvvm.js'));

b.add('./main.js');
b.bundle({standalone:'IMVVM'}).pipe(writer);

writer.on('finish', function() {
    console.error('Write successful. Compressing...');
    compressor.compress('./dist/imvvm.js', {
        //Compressor Options:
        charset: 'utf8',
        type: 'js',
    }, function(err, data, extra) {
      fs.writeFile("./dist/imvvm.min.js", data, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Files saved!");
        }
      });
    //err   If compressor encounters an error, it's stderr will be here
    //data  The compressed string, you write it out where you want it
    //extra The stderr (warnings are printed here in case you want to echo them
    });
});

