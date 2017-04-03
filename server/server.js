//recipe for creating our backend
const Knex = require('knex');
const morgan = require('morgan');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const knexConfig = require('../knexfile');
const registerApi = require('./api');
const Model = require('objection').Model;
const cors = require('cors');
const path = require('path');

// load env variables
dotenv.load();

// load database things and bind to models
const knex = Knex(knexConfig.development);
Model.knex(knex);

//here be the server
const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(morgan('dev'))
  .set('json spaces', 2)
  .use(express.static('./app/build'));  // serve the react client app

// pull server into API context
// this was badass
registerApi(app);

// catch all errors up front and use next() cleverly
app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(err.statusCode || err.status || 500).send(err.data || err.message || {});
  } else {
    next();
  }
})

// if you decide to use browserHistory instead of hashHistory
// in react-router
app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, 'app/build/index.html'));
});

// listen and serve
app.listen(port, function () {
  console.log('Cvrcle listening on port ' + port);
});