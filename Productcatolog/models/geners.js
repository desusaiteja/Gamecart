var mongoose = require('mongoose');

var generSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    create_date:{
        type:Date,
        default:Date.now
    }
});

var Genre = module.exports = mongoose.model('Geners', generSchema);
//CRUD
//Get Genres
module.exports.getGeners = function(callback, limit){
    Genre.find(callback).limit(limit);
}
// Add Genere
module.exports.addGener= function(geners, callback){
    Genre.create(geners, callback);
}
//Update Genere
module.exports.updateGener= function(id,geners,options, callback){
   var query={_id: id};
   var update = {
		name:genre.name
   }
   Genre.findOneAndUpdate(query, update, options, callback);
}
//Delete Geners
module.exports.removeGener= function(id, callback){
    var query={_id: id};
	Genre.remove(query, callback);
}
