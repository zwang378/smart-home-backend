// LIST DEPENDENCIES 

const express = require('express');
const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const uniqueValidator = require('mongoose-unique-validator');
const mustacheExpress = require('mustache-express');
const mongoose = require('mongoose');
const session = require('express-session');
const Shlog = require('./models/shlog');
const Code = require('./models/auth_code');
const cors = require('cors');
const app = express();
const url = process.env.MONGO_URI;

// SET APP ENGINE 

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressValidator());

// MONGOOSE PROMISE 

mongoose.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
    }
});

// TEST THE CONNECTION

app.use(function (req, res, next) {
    console.log('You used app');
    next();
})

app.get('/', function (req, res) {
    res.json('You did it');
});

// GET ALL SHLOGS

app.get('/api/shlogs', cors(), function (req, res) {
    Shlog.find({}).then(eachOne => {
        res.json(eachOne);
    })
});

// POST NEW SHLOG 

app.post('/api/shlogs', cors(), function (req, res) {
    Shlog.create({
        message: req.body.message,
        time: req.body.time
    }).then(shlog => {
        res.json(shlog)
    });
});

// POST OPEN DOOR MSG 

app.post('/api/dooropen', cors(), function (req, res) {
    console.log(req.body);

    Shlog.create({
        message: req.body.message,
        time: req.body.time
    }).then(shlog => {
        res.json(shlog)
    });
});

// POST CLOSE DOOR MSG

app.post('/api/doorclosed', cors(), function (req, res) {
    console.log(req.body);

    Shlog.create({
        message: req.body.message,
        time: req.body.time
    }).then(shlog => {
        res.json(shlog)
    });
});

// SEND AUTH CODE AND RECEIVE ACCESS TOKEN

app.post('/api/code', cors(), function (req, res) {
    console.log(req.body.code);

    var request = require('request');

    var headers = {
        'Content-Type': 'application/json'
    };

    var dataString = {
        "grant_type": "authorization_code",
        "code": req.body.code,
        "client_id": "gk1nFtbQr4pBpJD0rzAp3vaSi555sm4s",
        "client_secret": "eWTSj_izMvD3nBJFXxkRDZF4aXDGKofYRZyzw_31oer31kuoY6-OVDs27nEHJu0B",
        "redirect_uri": "http://localhost:3000/callback"
    };

    var options = {
        url: 'https://login-sandbox.safetrek.io/oauth/token',
        method: 'POST',
        headers: headers,
        body: dataString,
        json: true
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(JSON.stringify(body));

            const fsAccessToken = require('fs');
            let data = JSON.stringify(body);
            fsAccessToken.writeFileSync('tokens.json', data);
        }

    }

    request(options, callback);

});

// REQUEST ALARM

app.post('/api/alarm', cors(), function (req, res) {
    console.log(req.body);
    
    Shlog.create({
        message: req.body.message,
        time: req.body.time
    }).then(shlog => {
        res.json(shlog)
    });

    const fs = require('fs');

    let rawdata = fs.readFileSync('tokens.json');
    let tokens = JSON.parse(rawdata);
    console.log('access_token: ' + tokens.access_token);

    var requestAlarm = require('request');

    var headers = {
        'Authorization': 'Bearer ' + tokens.access_token,
        'Content-Type': 'application/json'
    };

    var dataString = {
        "services": {
            "police": false,
            "fire": false,
            "medical": true
        },
        "location.coordinates": {
            "lat": 34.32334,
            "lng": -117.3343,
            "accuracy": 5
        }
    };

    var options = {
        url: 'https://api-sandbox.safetrek.io/v1/alarms',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dataString)
    };

    function callback(error, response, body) {
        // if (!error && response.statusCode == 200) {
        //     console.log(body);
        // }
    }

    requestAlarm(options, callback);
    res.json("good");
});

// APP LISTEN ON ENVIRONMENT PORT

app.listen(process.env.PORT || 3004);
// app.listen(3004);
console.log('starting applicaiton.  Good job!');

// EXPORT APP

// module.exports = app;