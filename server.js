var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var passport = require('passport');
var auth = require('./auth.js')();
require('./auth.js')(passport)

var ShortUrl = require('./ShortUrl')
var UserAuth = require('./user')

var mongoose = require('mongoose');

var config = require('./config.js');

var jwt = require('jsonwebtoken');

mongoose.connect('mongodb://chungc4:Flyingsaucer123@ds251210.mlab.com:51210/ada_tinyurl')

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(auth.initialize());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/', function(req,res){
    res.json({message:"Welcome to my API"})
});

router.route('/shorturl/new')
    .post(function(req,res){
        ShortUrl.findOne({original_url:req.body.original_url}, function(err,url){
            if (err) res.json(err);
            else{
                if(url){
                    res.json({original_url:url.original_url, short_url:url.short_url})
                }
                else{
                    ShortUrl.count(function(err, count){
                        var newUrl = new ShortUrl();
                        newUrl.original_url = req.body.original_url;
                        newUrl.short_url = count + 1;
                        newUrl.save(function(err){
                            if (err) return res.json(err)
                                else
                                res.json(newUrl);
                        });
                    });
                }
            }
        });
    });

router.route('/shorturl/:url')
    .get(function(req,res){
        ShortUrl.findOne({short_url:req.params.url}, function(err,url){
            if (err) return res.json(err);
                else   
                res.json(url);
        });
    });


router.route('/register')
    .post(function(req,res){
        var newUser = new UserAuth();
        newUser.username = req.body.username;
        newUser.password = req.body.password;
        newUser.save(function(err){
            if (err) res.send(err);
            res.json({ message: 'User Successfully Registered!'});
        });
    });

router.route('/login')
    .post(function(req,res){
    //     UserAuth.findOne({username: req.body.username, password: req.body.password}, function(err,user){
    //         if (err) {
    //             return res.json(err);
    //         }
    //         else {
    //             if (user){
    //                 res.json({message:"user successfully logged in"})
    //             }
    //             else {
    //                 res.json({message:"error logging in"});
    //             }
              
    //         }
    //     })

    //check if password matches
    UserAuth.findOne({username:req.body.username}, 
        function(err, user){
        if(err){
            res.json(err)
        } 
        else {
            if(user){
                user.verifyPassword(req.body.password, function(err, isMatch){

                    if (isMatch && !err){
                        //create token if the password matched adn no error was thrown
                        var token = jwt.sign(user.toJSON(), config.secret, {
                            expiresIn:10080 //in seconds
                        });
                        res.json({success: true, token: token});
                    }
                    else {
                        res.send({success: false, message: 'Authentication failed. Password incorrect'})
                    }
                });

            } 
            else {
                res.json({message:"Error logging in"});
            };
        };
    
    });
});

router.get('/dashboard', auth.authenticate(), function(req, res){
    res.send('It worked. User id is '+req.user.username+ '.');
});


app.use('/api', router);

app.listen(port);

console.log('Magic happens in port 8080')