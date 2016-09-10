var _userserver = undefined;

loadPathListeners();

/**
 * loadPathListeners load all paths to which userserver has to listen and attach
 *                     callbacks for the same.
 * @return n/a
 */

var Request = require('./user.js').Request;

function createRequest(req, res) {
    var id = Request.createNewRequest();
    console.log(id);
    setTimeout(function() {
        Request.getReqest(id, function(err, request) {
            console.log(err, request);
        });
    }, 1000);
    res.send(200, "I am awesome");
}

var handleShutdown = function() {
    console.log("I am shutting down");
}

function loadPathListeners() {
    _userserver = require('./app').init('8000', handleShutdown);

    _userserver.post('/request', createRequest);
    _userserver.get('/request', createRequest);
}


