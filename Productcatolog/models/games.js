var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    price:{
        type:String,
        required:true
    },
    product_id:{
        type:String,
        required:true
    },
    image_url:{
        type:String
    },
    create_date:{
        type:Date,
        default:Date.now
    }
});

var Games = module.exports = mongoose.model('Games', gameSchema);

//Get Games
module.exports.getGames= function(callback, limit){
    Games.find(callback).limit(limit);
}

module.exports.getGamesById= function(id, callback){
    Games.findById(id, callback);
}

module.exports.getGamesByproductId= function(id, callback){
    Games.find({product_id:id}, callback);
}

module.exports.addGames= function(games, callback){
    Games.create(games, callback);
}
//Update
module.exports.updateGame= function(id,games,options, callback){
   var query={_id: id};
   var update = {
		name:games.name,
		description:games.description,
		price:games.price,
		product_id:games.product_id,
		image_url:games.image_url
   }
   Games.findOneAndUpdate(query, update, options, callback);
}

module.exports.removeGame= function(id, callback){
    var query={_id: id};
	Games.remove(query, callback);
}
