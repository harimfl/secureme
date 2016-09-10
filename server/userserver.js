var _userserver = undefined;
_ = require('underscore');
loadPathListeners();

/**
 * loadPathListeners load all paths to which userserver has to listen and attach
 *                     callbacks for the same.
 * @return n/a
 */

var Request = require('./user.js').Request;
var User = require('./user.js').User;

function createRequest(req, res) {
    res.send(200, "I am awesome");
    return;
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});

    var message = (req.message) ?  req.message : "";
    var type = (req.type) ?  req.type : 0;
    var gps = (req.gps) ?  req.gps : 0;
    var userid = (req.userid) ?  req.userid : "";

    var requestId = Request.createNewRequest(gps, type, message, userid);
    var resp = {
        success: true,
        requestId: requestId
    };
    res.send(200, JSON.stringify(resp));
}

function getAllUserRequest(req, res) {
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});

    var userid = req.params.userid;

    console.log("Inderpal -- ", userid);

    var requestData = Request.getUsersRequest(userid, function(err, result) {
        var resp = {
            success: false
        };
        if (!err && result) {
            resp.success = true;
            resp.requests = [];
            for (var i = 0; i < result.length; i++) {
                var meta = {};
                meta.type = result[i].type;
                meta.status = result[i].status;
                meta.message = result[i].message;
                meta.timestamp = result[i].timecreated;
                resp.requests.push(meta);
            }
        }
        res.send(200, JSON.stringify(resp));
    });
}

function getAllRequestForState(req, res) {
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});

    var state = req.params.state;
    var requestData = Request.getRequestForState(state, function(err, result) {
        var resp = {
            success: false
        };
        if (!err && result) {
            resp.data = [];
            resp.success = true;
            var finalLength = result.length;
            console.log("Inderpal finalLength ", finalLength);
            var checkProgess = function() {
                console.log("Inderpal getting called ", finalLength);
                if (--finalLength == 0) {
                    // Add sorting based on type
                    //
                    console.log(resp.data);
                    resp.data = resp.data.sort(function(a, b) {
                        return a.type - b.type;
                    });
                    console.log(resp.data);
                    res.send(200, JSON.stringify(resp));
                }
            };

            var getUserInfo = function(meta) {
                User.getUser(meta.userid, function(err, user) {
                    console.log(user);
                    if (!err && user) {
                        meta.name = user.name;
                        meta.phoneNumber = user.phoneNumber;
                    }
                    resp.data.push(meta);
                    checkProgess();
                });
            };

            for (var i = 0; i < result.length; i++) {
                var meta = {
                    requestid: result[i].id,
                    type: result[i].type,
                    gps: result[i].gps,
                    message: result[i].message,
                    userid: result[i].userid
                };
                console.log("Calling for ", meta.userid);
                getUserInfo(meta);
            }
        } else {
            res.send(200, JSON.stringify(resp))
        }
    });
}

var handleShutdown = function() {
    console.log("I am shutting down");
}

function registerUser(req, res) {
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});

    var name = (req.params.name) ? req.params.name : "";
    var phoneNumber = (req.params.phoneNumber) ? req.params.phoneNumber : "";

    console.log(name, phoneNumber);

    var userid = User.createNewUser(name, phoneNumber);
    var resp = {
        success: true,
        userid: userid
    };

    console.log(userid);
    res.send(200, JSON.stringify(resp));
}

function getUserDetails(req, res) {
    req.params=_.extend(req.params || {}, req.query || {}, req.body || {});

    var userid = req.params.userid;

    var resp = {
        success: false
    };

    User.getUser(userid, function (err, user) {
        if (!err && user) {
            resp.success = true;
            resp.name = user.name;
            resp.phoneNumber = user.phoneNumber;
        }
        res.send(200, JSON.stringify(resp));
    });
}

function loadPathListeners() {
    _userserver = require('./app').init('8000', handleShutdown);

    _userserver.post('/request', createRequest);
    _userserver.get('/request', createRequest);

    _userserver.get('/register', registerUser);
    _userserver.post('/register', registerUser);

    _userserver.post('/getUser', getUserDetails);
    _userserver.get('/getUser', getUserDetails);

    _userserver.post('/getAllUserRequest', getAllUserRequest);
    _userserver.get('/getAllUserRequest', getAllUserRequest);

    _userserver.get('/getAllRequestForState', getAllRequestForState);
    _userserver.post('/getAllRequestForState', getAllRequestForState);
}


