const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routers = require('./routers');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/wir-db');
mongoose.Promise = global.Promise;
app.use(bodyParser.json());
app.use('/api',routers);

app.use(function(err, req, res, next){
    res.status(422).send({err:err.message});
});

app.listen('5000', function(){
    console.log('KUMIS KUCING');
});