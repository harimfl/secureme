var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var filesys = require('fs');

router.get('/', function (req, res) {
    console.log("ashdkahs 1");
    req.body.state = 0;
    request.post({
        url: "http://dev-in-3.aliathegame.com:10000/getAllRequestForState",
        form: req.body,
        json: true
    }, function (error, response, body) {
        console.log(error, response);
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }
        var resp = "";
        var aa = filesys.readFileSync(__dirname + '/test.html', 'utf-8');
        var fillhtml = "";
        for (var i = 0; i < response.body.data.length; i++) {
            var info = response.body.data[i];
            var test = "<div class=\"row\">";
            test += "<div class=\"cell\">";
            test += info.requestid
            test += "</div>"
            test += "<div class=\"cell\">";
            test += info.name
            test += "</div>"
            test += "<div class=\"cell\">";
            test += info.userid
            test += "</div>"
            test += "<div class=\"cell\">";
            test += info.type
            test += "</div>"
            test += "<div class=\"cell\">";
            test += info.date
            test += "</div>"
            test += "<div class=\"cell\">";
            test += info.phoneNumber
            test += "</div>"
            test += "</div>"
            fillhtml += test;
        }
        aa = aa.replace('%FILL_DATA%', fillhtml);
        aa = aa.replace('%CLASS_NAME%', "red");

        var viewData = { aa: aa };
        res.send(aa);
    });
});

router.post('/', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    //
    //
    console.log("ashdkahs");
    req.body.state = 2;
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