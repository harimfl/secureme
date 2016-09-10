/* 
 * app.js
 * 
 * Our base app code, including Express configs
 */

var express = require('express')
  , engine = require('ejs-locals')
  , winston = require('winston')
  , expressValidator = require('express-validator')
  , _ = require('underscore')
  , app = express();

var xmlparser = require('express-xml-bodyparser');

exports.init = function(port, shutdownCallback) {
    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(express.bodyParser());
        app.use(xmlparser());
        app.use(expressValidator({
            errorFormatter: function(param, msg, value) {
                var namespace = param.split('.')
                , root    = namespace.shift()
                , formParam = root;
          
              while(namespace.length) {
                formParam += '[' + namespace.shift() + ']';
              }
              return {
                param : formParam,
                msg   : msg,
                value : value
              };
            }
        }));
        app.use(express.methodOverride());
        app.use('/html', express.static(__dirname + '/static'));
        app.use(app.router);
        app.enable("jsonp callback");
    });

    app.param(function(name, fn){
      if (fn instanceof RegExp) {
        return function(req, res, next, val){
          var captures;
          if (captures = fn.exec(String(val))) {
            req.params[name] = captures;
            next();
          } else {
            next('route');
          }
        }
      }
    });

    app.engine('ejs', engine);

    app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
      app.set("base64encoding", true);
    });

    app.configure('production', function(){
      app.set("base64encoding", true);
      app.use(express.errorHandler()); 
    });

    app.get("/tambola", function(req, res) {
      if(
        req.headers['user-agent'].match(/Android/i) ||
        req.headers['user-agent'].match(/iPhone|iPad|iPod/i) ||
        req.headers['user-agent'].match(/IEMobile/i) // yeah i know we can combine those, duh!
        ) {
        res.redirect("tambola://tambola.moonfrog.com/"); 
      } else {
        res.redirect("http://moonfroglabs.com");
      }
    });

    app.use( function(err, req, res, next) {
        res.render('500.ejs', { locals: { error: err }, status: 500 });
    });
    
    server = app.listen(port);
    winston.info("Listening on port %d in %s mode", server.address().port, app.settings.env);
    
    process.on('SIGTERM', function() {
      server.close(function() {
        console.log("Exiting ... Cleaning data/connections.");
        shutdownCallback(function() {
          console.log("Bye!");
          process.exit();
        });
      });

      setTimeout(function() {
        console.log("Could not close connections in time, forcefully shutting down!");
        console.log("Bye!");
        process.exit(1);
      }, 30*1000);
    });

    function log_error(msg) {
      if (winston && winston.error) {
        winston.error(msg);
      }    
    }

    process.on('uncaughtException', function(err) {
      console.log('***************************');
      console.log('Caught exception: ' + err);
      console.log(err.stack);
      console.log('***************************');
      log_error({err: err, stackTrace: err.stack});
    });
  
    return app;
}
