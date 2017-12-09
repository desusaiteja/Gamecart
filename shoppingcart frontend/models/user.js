/*
var mangoose = require('mangoose');
var bcrypt = require('bcrypt-nodejs');

var signup_schema = new mongoose.Schema({
    firstname : {type:String,required: true},
    lastname  : {type:String,required: true},
    email     : {type:String,required: true},
    address   : {type:String,required: true},
    phone     : {type:String,required: true},
    password: {type:String,required: true}
});

signup_schema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

signup_schema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}

module.exports= mongoose.model('Users', signup_schema);
*/