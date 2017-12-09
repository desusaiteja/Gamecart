/*
var passport = require('passport');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    console.log('Inside serilaizeuser');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('Inside deserilaizeuser');
    getUserById(id, function(err, user) {
        done(err, user);
    });
});



passport.use('local.signup',new LocalStrategy({
    usernameField:"email", 
    passwordField:"password"
    passReqToCallback: true
}, function(req, email, password, done){
    console.log('inside passport use');
    getUserByUsername(email, function(err, user){
        //rest of the code 
        if(err) return done(err);
        if(user) {
            return done(null,false,{message:"Email Already in Use"});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err,result){
            if (err) return done(err);
            return done(null,newUser);
        });





        if(!user){
            return done(null, false, {message: 'Invalid User'});
        }
        comparePassword(password, users.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid Password'});
            }


        })

    });
}));

function getUserById(id, callback){
    console.log('inside getuserbyid function');
    Users.findById(id, callback);
}

function getUserByUsername(email, callback){
    console.log('inside getuserbyusername function');
    var query = {'email' : email};
    User.findOne(query, callback);
}
*/