var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport'); 
var flash    = require('connect-flash');
var session      = require('express-session');

//For Login Database
mongoose.connect('mongodb://localhost:27017/UserLog');

//mongoose.connect('mongodb://172.17.0.3:32768/UserLog');

//require('./config/passport');

var index = require('./routes/index');

var signup = require('./routes/signup');

var app = express();


// view engine setup
app.engine('.hbs',expressHbs({defaultLayout:'layout',extname:'.hbs'}))
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret : 'secret',
  saveUninitialized: false,
  resave: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
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

app.use(flash());


//Global Variables

app.use(function (req,res,next) {
  res.locals.success_msg =req.flash('success_msg');
  res.locals.error_msg =req.flash('error_msg');
  res.locals.error =req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', index);
app.use('/signup', signup);


app.get('/signin', function(req,res){
  res.render('user/signin');
})

app.get('/signup', function(req,res){
  res.render('user/signup');
})

app.get('/admin', function(req,res){
    res.render('user/admin');
})




//Commented Just for the sake of the tutorial
// app.use('/signup', signup);


// app.get('/user/signup', function(req,res,next){
//   res.render('user/signup');// Passing the CSRF token to the signup view
  
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
