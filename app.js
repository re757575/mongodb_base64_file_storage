/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Article = require('./Article');
var GridFS = require('GridFS').GridFS;
var MongoDb = require("mongodb");
var fs = require("fs");
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

console.log(new Buffer("Hello World").toString('base64'));
console.log(new Buffer("SGVsbG8" + "gV29ybGQ=", 'base64').toString('ascii'))

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');

});

// save/update a new article
app.post("/article", function(req, res, next) {
    var input = req.body;
    /*var myFS = new GridFS('test');


    var data = fs.readFileSync(req.files.myfile.path);
    // Functions are performed in the order they are queued
    myFS.put(data, req.files.myfile.name, 'w', function(err, fileInfo) {
        if (err) console.log(err);


        myFS.get(fileInfo._id, function(err, data) {
            if (err) throw err;
            console.log(data);
            res.contentType("audio\/mp3");
            res.end(data.buffer, "binary");
        });
    });*/





    if (!input.author) {
        res.json("author must be specified when saving a new article", 400);
        return;
    }

    if (!input.content) {
        res.json("content must be specified when saving a new article", 400);
        return;
    }
    console.log(input);
    console.log("req.files.myfile:" + req.files.myfile);

    Article.save(input, req.files.myfile, function(err, objects) {
        if (err) {
            res.json(error, 400);
        } else if (objects === 1) { //update
            input.myfile = undefined;
            res.json(input, 200);
        } else { //insert
            input.myfile = undefined;
            res.json(input, 201);
        }
    });

});



// list all articles
app.get('/articles', function(req, res) {
    Article.findAll(function(error, results) {
        if (error) {
            res.json(error, 400);
        } else if (!results) {
            res.send(404);
        } else {
            var i = 0,
                stop = results.length;

            for (i; i < stop; i++) {
                results[i].myfile = undefined;
            }

            res.json(results);
        }
    });
});


// get the JSON representation of just one article
app.get("/article/:id", function(req, res) {
    Article.findById(req.params.id, function(error, result) {
        if (error) {
            res.json(error, 400);
        } else if (!result) {
            res.send(404);
        } else {
            result.myfile = undefined;
            res.json(result);
        }
    });
});


// get the myfile of a particular article
app.get("/article/:id/file", function(req, res) {
    Article.findById(req.params.id, function(error, result) {
        if (error) {
            res.json(error, 400);
            // } else if (!result || !result.myfileType || !result.myfile || !result.myfile.buffer || !result.myfile.buffer.length) {
        } else if (!result || !result.myfile) {
            res.send(404);
            console.log("找不到圖片");
        } else {
            res.contentType("application/json");

            /*
                res.end(result.myfile.buffer);
                等於 
                var originaldata = new Buffer(result.myfile.buffer, 'base64');
                console.log(originaldata);
                res.end(originaldata);
            */
            res.end(result.myfile.buffer);

            /*下載*/
            //console.log(result.myfileName.split('.')[0]);
            //res.setHeader('Content-disposition', 'filename='+(result.myfileName.split('.')[0]));
            //res.setHeader('Content-Length=',result.size);

        }
    });
});


/*
var GridFS = require('GridFS').GridFS;

// Use the test database
var myFS = new GridFS('test');
var text = new Buffer('Hello World!');

// Functions are performed in the order they are queued
myFS.put(text, 'Hello World!', 'w', function(err) {
    if (err) console.log(err);
});

myFS.get('Hello World!', function(err, data) {
    console.log(data);
});

*/
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
