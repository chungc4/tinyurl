//strategy is different ways of logging in users

var JwtStrategy = require('passport-jwt').Strategy;

var ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('./user.js');

var config = require('./config.js');

var passport = require('passport');

var params = {
    secretOrKey:config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = function(){
    var strategy = new JwtStrategy(params, function(payload, done){
        console.log(payload)
        User.findOne({id:payload.id}, function(err, user){
            if (err) {
                return done(err, false)
            }
            if(user){
                done(null, user);
            } else {
                done(null, false);
            }
        })
    })
    passport.use(strategy);
    return {
        initialize: function(){
            return passport.initialize();
        },
        authenticate: function(){
            return passport.authenticate('jwt', {
                session: false
            });
        }
    };
};