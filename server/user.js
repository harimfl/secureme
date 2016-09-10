var mongoose = require('mongoose');

Schema = mongoose.Schema;

var db_conn = mongoose.connect('mongodb://localhost:27017/secureme');

var requestSchema = new Schema({
    id: { type: String, required: true },
},
{autoIndex: false});

requestSchema.statics.getReqest = function(requestId, callback) {
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

requestSchema.statics.createNewRequest = function(data) {
    var request = new Request;
    request.id = generateRequestId();
    request.save();
    return request.id;
}

var Request = mongoose.model('Request', requestSchema);
exports.Request = Request;