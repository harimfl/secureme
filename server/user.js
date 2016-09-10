var mongoose = require('mongoose');

Schema = mongoose.Schema;

var db_conn = mongoose.connect('mongodb://localhost:27017/secureme');

var requestSchema = new Schema({
    id: { type: String, required: true },
    gps: { type: String },
    type: { type: Number, default: 1},
    message: { type: String, default: ""},
    userid: { type: String, default: ""},
    status: { type: Number, default: 0},
    timecreated: { type: Number, default: 0}
},
{autoIndex: false});

requestSchema.statics.getRequest = function(requestId, callback) {
    Request.findOne({'id': requestId}, function(err, request) {
        if (!err && request) {
            callback(false, request);
        } else {
            callback(true);
        }
    });
}

function generateRequestId() {
    return parseInt(Math.random() * 10000000).toString();
}

requestSchema.statics.createNewRequest = function(gps, type, message, userid, requestId, status) {
    console.log(gps, type, message, userid, requestId);
    var request = new Request;
    request.id = (requestId) ? requestId : generateRequestId();
    request.gps = gps;
    request.type = type;
    request.message = message;
    request.userid = userid;
    request.status = (status) ? status : 0;
    request.timecreated = Date.now();
    request.save();
    return request.id;
}

requestSchema.statics.getUsersRequest = function(userid, callback) {
    Request.find({userid: userid}, function(err, requests) {
        if (!err && requests) {
            callback(false, requests);
        } else {
            callback(true);
        }
    });
}

requestSchema.statics.getRequestForState = function (state, callback) {
    Request.find({status: state}, function(err, resp) {
        if (!err && resp) {
            callback(false, resp);
            return;
        }
        callback(true);
    });
}

var Request = mongoose.model('Request', requestSchema);
exports.Request = Request;



var userSchema = new Schema({
    id: { type: String, required: true },
    phoneNumber: { type: String, default: ""},
    name: { type: String, default: ""},
    timecreated: { type: Number, default: 0}
},
{autoIndex: false});

userSchema.statics.getUser = function(userId, callback) {
    User.findOne({'id': userId}, function(err, user) {
        if (!err && user) {
            callback(false, user);
        } else {
            callback(true);
        }
    });
}

function generateUserId() {
    return parseInt(Math.random() * 10000000).toString();
}

userSchema.statics.createNewUser = function(phoneNumber, name, userId) {
    console.log(phoneNumber, name, userId);
    var user = new User;
    user.id = (userId) ? userId : generateUserId();
    user.name = name;
    user.phoneNumber = phoneNumber;
    user.timecreated = Date.now();
    user.save();
    return user.id;
}

var User = mongoose.model('User', userSchema);
exports.User = User;


