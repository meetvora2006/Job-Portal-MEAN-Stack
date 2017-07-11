var express = require('express');
var app = express();
var url = require('url');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({'extended': false}));
app.use(bodyParser.json());

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/js_june');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('we are connected to database!');
});

var Schema = mongoose.Schema;

var jobSchema = new Schema({
    username: String,
    password: String,
    email: String,
    location: String,
    phone: Number,
    type: String,
    myposts: [{title: String, description: String, keywords: String, location: String}]
});

var Job1 = mongoose.model('Job1', jobSchema);

app.use(express.static(__dirname));

//function routeHandler(app){
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/postData', function (req, res) {
    var item = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        location: req.body.location,
        phone: req.body.phone,
        type: req.body.type

    };

    var data = new Job1(item);
    data.save();
    res.send(200);
});

app.get('/getData', function (req, res, next) {
    Job1.find()
            .then(function (doc) {
                res.json(doc);
            });
});

app.get('/getjobsData', function (req, res, next) {
    Job1.find({},{myposts : 1})
            .then(function (doc) {
                res.json(doc);
            });
});

app.get('/getUserData', function (req, res, next) {


    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var id = req.query.id;

    Job1.findById(id)
            .then(function (doc) {
                res.json(doc);
            });
});


app.post('/updatepost', function (req, res, next) {

    var id = req.body.id;

    var item = {
        title: req.body.title,
        description: req.body.description,
        keywords: req.body.keywords,
        location: req.body.location
    };

    Job1.findById(id, function (err, doc) {
        if (err) {
            console.error('error, no entry found');
        }
        
       doc.myposts.push(item);
      
        doc.save();


    });

});

app.listen('3360', function () {
    console.log('server is listening on port 3360');
});