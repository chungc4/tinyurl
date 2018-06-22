var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-node');

var userAuthSchema = new Schema({
    username: {type: String, required: true},
    password: String,
    createdAt: {type: Date, default: Date.now},
})

userAuthSchema.pre('save', function(callback){
    var user = this
    
    if (!user.isModified('password')) return callback();

    bcrypt.genSalt(5, function(err,salt){
        if (err) return callback(err);

        bcrypt.hash(user.password,salt,null,function(err, hash){
            if (err) return callback(err);
            user.password = hash
            callback();
        });
    });
});

userAuthSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);  
    });
};



module.exports = mongoose.model('UserAuth', userAuthSchema);