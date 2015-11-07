var express = require('express');
var passport = require('passport');
var OAuth2Strategy= require('passport-oauth2').Strategy;
var mongoose = require('mongoose');
var User = require("./models/users.js");
var app = express();

// Connect to database
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
});

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://todoist.com/oauth/authorize',
  tokenURL: 'https://todoist.com/oauth/access_token',
  clientID: process.env.CLIENT_ID_TODOIST,
  clientSecret: process.env.CLIENT_SECRET_TODOIST,
  callbackURL: 'http://slacklemore-55043.onmodulus.net/auth/callback',
  scope: 'task:add,data:read',
  state: 'slacklemore',
  passReqToCallback: true},
  function(request, accessToken, refreshToken, profile, done) {
    console.log("request:" + JSON.stringify(request));
    console.log("accessToken:" + accessToken);
    console.log("refreshToken:" + refreshToken);
    console.log("profile:" + JSON.stringify(profile));
    done();
  }
));

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.post('/slash', function(req, res) {
  // 1. Get slack id from req.
  // 2. Use slack id to look up access token in the database.
  // 3. If found, send command over to todoist.
  // 4. If not found, send user the following url
});

// OAuth stuffs
app.get('/auth', passport.authenticate('oauth2'));

app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/sadface' }),
  function(req, res) {
    // Successful authentication.
    // 1. Save slack id -> token.
    // 2. Show magic page
    // 3. If time, use slack-notify to message you that you're good to go
    res.redirect('/');
  });

app.get('/sadface', function(req, res) {
  res.done();
});

var port = 8080;
app.listen(port);
console.log('Express server started on port %s', port);
