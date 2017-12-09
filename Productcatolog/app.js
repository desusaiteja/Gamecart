 var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fetch = require("node-fetch");

const headers = {
    'Accept': 'application/json'
  };

app.use(bodyParser.json());

Genre = require('./models/geners');
Games = require('./models/games');

var recommend_url = "http://localhost:5000/addproduct";

//Connect to Mongoose
 mongoose.connect('mongodb://localhost:27017/gamecart');
//mongoose.connect('mongodb://productcatalog:27017/gamecart');
//mongoose.connect('mongodb://172.17.0.2:27017/gamecart');
/* mongoose.Promise = global.Promise;
var mongoURL="mongodb://10.0.0.71:27017,10.0.0.59:27018/gamecart?replicaSet=example-replica-set&connectTimeoutMS=500";
mongoose.connect(mongoURL); */

//mongoose.connect(mongoURL, { useMongoClient: true });

var db = mongoose.connection

app.get('/', function(req,res){
    res.send('App Working');
});

app.get('/api/geners',function(req,res){
Genre.getGeners(function(err,geners){
    if(err){
        throw err;
    }
    res.json(geners);
 });
});

app.post('/api/geners',function(req,res){
    var geners = req.body;
    Genre.addGener(geners,function(err,geners){
        if(err){
            throw err;
        }
        res.json(geners);
     });
    });

app.get('/api/games',function(req,res){
    Games.getGames(function(err,games){
        if(err){
            throw err;
        }

        res.json(games);
     });
    });

app.get('/api/game/:_id',function(req,res){
        Games.getGamesById(req.params._id, function(err,game){
            if(err){
                throw err;
            }
            res.json(game);
         });
        });


app.get('/api/game/product/:prodid',function(req,res){
    console.log(req.params.prodid);
    Games.getGamesByproductId(req.params.prodid, function(err,game){
        if(err){
            throw err;
        }
        res.json(game);
     });
    });



app.post('/api/games',function(req,res){
        var games = req.body;
        console.log(games);
        Games.addGames(games,function(err,games){
            if(err){
                throw err;
            }
            var   body = {
                prod_id : games.product_id,
                name: games.name,
                description: games.description,
                price: games.price,
                geners: req.body.geners,
                image_url: games.image_url,
                create_date: games.create_date
            }
            console.log(body)
            fetch(recommend_url, {
                method: 'POST',
                headers: {
                    headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then(function (res) {
                //  console.log(res.json());
                //return res.json();
                return res.text();
            /* }).then(function(json) {
                console.log(json);  });
            }); */
            }).then(function(body) {
              console.log(body); 
              console.log("Inside post Response for share cart"); 
            });

             res.json(games);
            });
        });
// Added the code after this for week 6		
app.put('/api/geners/:_id',function(req,res){
    var id =req.params._id;
	var geners = req.body;
    Genre.updateGener(id,geners,{},function(err,geners){
        if(err){
            throw err;
        }
        res.json(geners);
     });
    });

app.put('/api/games/:_id',function(req,res){
    var id =req.params._id
	var games = req.body;
    Games.updateGame(id,games,{},function(err,games){
        if(err){
            throw err;
        }
        res.json(games);
     });
    });
//Delete Functionality
app.delete('/api/geners/:_id',function(req,res){
    var id =req.params._id;
    Genre.removeGener(id,function(err,geners){
        if(err){
            throw err;
        }
        res.json(geners);
     });
    });
	
app.delete('/api/games/:_id',function(req,res){
    var id =req.params._id;
    Genre.removeGame(id,function(err,games){
        if(err){
            throw err;
        }
        res.json(games);
     });
    });

app.listen(8080);
console.log('Running on port 8080...');

