var express = require('express');
var nani = require('nani');
var logger = require('morgan');
var bodyParser = require('body-parser');

var credentials = require('./js/credentials');

var app = express();
nani.init(credentials.client_id, credentials.client_secret);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.use('/', express.static('www'));
app.get('/dev', function(req, res) {
  nani.get('user/blankiee/animelist')
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      res.send(error);
    });
});
app.use('/username', function(req, res) {
  var username = req.body.username;
  nani.get('user/' + username + '/animelist')
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      res.sendStatus(404);
    })

});

app.use('/anime', function(req, res) {
  var anime_id = req.body.anime_id;
  nani.get('anime/' + anime_id)
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      res.sendStatus(404);
    })
});

app.use('*', function(req, res) {
  res.status(404).send("Not found");
});

app.listen(4000, function() {
  console.log("Server is listening on port 4000.");
});


