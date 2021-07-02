"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');

const middlewares = require('./middlewares');

const auth  = require('./routes/auth');
const storage  = require('./routes/storage');

const api = express();

// Adding Basic Middlewares
api.use(helmet());
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
api.use(middlewares.allowCrossDomain);

// Basic route
api.get('/api', (req, res) => {
    res.json({
        name: 'Hobb.ee Backend'
    });
});

// API routes
api.use('/api/auth', auth);
api.use('/api/storage', storage);

module.exports = api;
