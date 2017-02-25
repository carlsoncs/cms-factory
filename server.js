// server.js
// where your node app starts
let path = require('path');
let sh = require('shelljs');
let cap = require('./capture_utils');

// init project
var express = require('express');
var app = express();

console.log(`Base Directory Set To: ${sh.pwd()}`);


// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
app.set('views', path.join(__dirname + '/templates'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3030);
// http://expressjs.com/en/starter/static-files.html
console.log('Port #: ' + app.get('port'));

app.use(express.static('public'));


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {

  function renderTemplateBody(body){
    response.render('webContent', {'captured_html': body });}
  Object.defineProperty(renderTemplateBody, 'name',
    { __proto__: null,
      value: 'renderTemplateBody'  });
  let lastly = renderTemplateBody.bind(this);

  cap('https://slate.law', lastly);
});






app.get('/dreams', function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post('/dreams', function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  'Find and count some sheep',
  'Climb a really tall mountain',
  'Wash the dishes'
];

// listen for requests :)
var listener = app.listen(app.get('port'), function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


module.exports = app;
