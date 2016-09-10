var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var filesys = require('fs');
var _ = require('underscore');

router.get('/', function (req, res) {
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});
    console.log("ashdkahs 1");
    req.body.requestid = req.params.requestid;
    request.post({
        url: "http://dev-in-3.aliathegame.com:10000/completeRequest",
        form: req.body,
        json: true
    }, function (error, response, body) {
        console.log(error, response);
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }
        res.redirect('/progress');
    });
});

router.post('/', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    //
    //
    console.log("ashdkahs");
    req.body.state = 0;
    request.post({
        url: "http://dev-in-3.aliathegame.com:10000/getAllRequestForState",
        form: req.body,
        json: true
    }, function (error, response, body) {
        console.log(error, response);
        // if (error) {
        //     return res.render('login', { error: 'An error occurred' });
        // }

        // if (!body.token) {
        //     return res.render('login', { error: body, username: req.body.username });
        // }

        // // save JWT token in the session to make it available to the angular app
        // req.session.token = body.token;

        // // redirect to returnUrl
        // var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
        // res.redirect(returnUrl);
    });
});

module.exports = router;