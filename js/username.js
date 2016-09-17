var express = require('express');
var router = express.Router();
var nani = require('nani');
var bodyParser = require('body-parser');

var credentials = require('./credentials');
nani.init(credentials.client_id, credentials.client_secret);

router.use(function logUser(req, res, next) {
  console.log(req.username.toString());
  next();
});

router.get('/username')

module.exports = router;
