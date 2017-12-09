var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var mongoose = require('mongoose');
const fetch = require('node-fetch');



//mongoose.connect('172.17.0.4:27017/shopping');

mongoose.connect('localhost:27017/shopping');

//this URL is on which the product catalogue API is running on
const product_url = "http://localhost:8080/"
console.log("Product URL is"+product_url);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("connection succeded");
});

router.get('/', function (req, res) {
    res.send('App Working');    
});

//This for adding to the cart
router.post('/add-to-cart/', function (req, res, next) {
    console.log("Inside the add to cart by id post method")

    var id = req.body.prodid;
    console.log('inside add to cart, product added is' + id);
    var cart_id = req.body.email;
    console.log("cart id is "+cart_id);

    var qty = 1;
    var products = [];
    products.push({product_id: id, qty: qty});
    console.log(products);
    var cart1 = db.collection('carts');
        cart1.find({$and:[{cart_id: cart_id},{share_id:null}]}).toArray(function (err, result)
        {
            console.log(result);
            if(result.length > 0){
                var cart2 = db.collection('carts');
                cart2.find({$and:[{cart_id: cart_id},{share_id:null},{'products.product_id': id}]}).toArray(function (err, result1){
                    console.log("Resultn 1" + result1);
                    if(result1.length > 0){
                        console.log("this is for only product pres");
                        cart2.findOneAndUpdate({$and:[{cart_id: cart_id},{share_id:null},{'products.product_id': id}]}, {$inc: {'products.$.qty': 1}});
                    }else{console.log("product not there");
                        var qty2 = 1;
                        cart2.findOneAndUpdate({$and:[{cart_id: cart_id},{share_id:null}]}, {$push: {products:{product_id: id, qty: qty2}}});
                    }
                })
            }else{console.log("cart no there");
                var qty = 1;
                var products = [];
                products.push({product_id: id, qty: qty});

                var cart = new Cart({
                    cart_id: cart_id,
                    products: products,
                    share_id:null
                });
                cart.save(function(error){
                    console.log('saved succesfully');
                    if (error){
                        console.log('Error is' + error);
                        //handleError(res, err);
                    }
                //    res.sendStatus(200);
                });

            }
        });
    /* res.redirect('/'); */
    res.sendStatus(200);
});

//add-to-sharecart

//This for adding to the sharecart
router.post('/add-to-sharecart/', function (req, res, next) {
    console.log("Inside the add to #SHARE# cart by id post method")

    var id = req.body.prodid;
    var share_id = req.body.share_id;
    console.log('inside add to cart, product added is' + id);
    console.log('inside add to cart, share_id added is' + share_id);
    var cart_id = req.body.email;
    console.log("cart id is "+cart_id);

    var qty = 1;
    var products = [];
    products.push({product_id: id, qty: qty});
    console.log(products);
    var cart1 = db.collection('carts');
        cart1.find({share_id:share_id}).toArray(function (err, result)
        {
            console.log(result);
            if(result.length > 0){
                var cart2 = db.collection('carts');
                cart2.find({$and:[{share_id:share_id},{'products.product_id': id}]}).toArray(function (err, result1){
                    console.log("Resultn 1" + result1);
                    if(result1.length > 0){
                        console.log("this is for only product pres");
                        cart2.findOneAndUpdate({$and:[{share_id:share_id},{'products.product_id': id}]}, {$inc: {'products.$.qty': 1}});
                    }else{console.log("product not there");
                        var qty2 = 1;
                        cart2.findOneAndUpdate({$and:[{share_id:share_id}]}, {$push: {products:{product_id: id, qty: qty2}}});
                    }
                })
            }else{console.log("cart not there");
                var qty = 1;
                var products = [];
                products.push({product_id: id, qty: qty});

                var cart = new Cart({
                    cart_id: cart_id,
                    products: products,
                    share_id:share_id
                });
                cart.save(function(error){
                    console.log('saved succesfully');
                    if (error){
                        console.log('Error is' + error);
                        //handleError(res, err);
                    }
                   // res.sendStatus(200);
                });

            }
        });
        res.sendStatus(200);
    });



//The below get_products function is for fetching the games from the product catalogue API
// using the node-fetch async/await API

const get_products = async url=>{
    try{
      const response = await fetch(url);
      const json = await response.json();
      console.log("JSON Object is "+json);
      return json;
    }
    catch(error){
      console.log("Error inside the product fetching"+error);
    }
  }

router.get('/shopping-cart/:emailid', function (req, res, next) {
    var prod_arr;
    var final_products = [];
    var emailid = req.params.emailid;

    var cart = db.collection('carts');
    cart.update({cart_id: emailid},{$pull: {'products' : {'qty' : 0}}},{multi : true});
        cart.find({$and:[{cart_id: emailid},{share_id:null}]}).toArray(function (err, result) {
            if(result.length > 0){
                console.log("inside loop...1")
                console.log(result[0].products)
                console.log(typeof result[0].products)
                var x = result[0].products;
                var productlist = x.map(function(product) {
                    return product['product_id'];
                });
                console.log("Product list is"+productlist);
                console.log(typeof productlist);
                var quantity = x.map(function(product) {
                    return product['qty'];
                });
                console.log(quantity);
                var qaunt_arr = Array.prototype.slice.call(quantity);

                    const bb = Array.prototype.slice.call(productlist);
                    console.log(
                        Array.isArray(bb) // true
                    );
                    console.log("bb is"+bb); // array of product id's

                    for(var xyz = 0; xyz < bb.length;xyz++){
                        console.log("Starting point XYZ is "+xyz);                        
                        console.log("bb["+xyz+"]"+bb[xyz]);
                        get_products(product_url+"api/game/product/"+bb[xyz])
                        .then(
                          json_string => {console.log("After Fetching Json String"+json_string);
                          var product_array = JSON.parse(JSON.stringify(json_string));
                          console.log("Product Array is");
                          console.log(product_array);
                          prod_arr = Array.prototype.slice.call(product_array);
                          console.log(
                              Array.isArray(prod_arr) // true
                          );
                          function findProdPosition(element) {
                            if (element == prod_arr[0].product_id){
                                return element;
                            }
                          }
                          var game_id = prod_arr[0].product_id;
                          var index_prodid = productlist.findIndex(findProdPosition);
                          console.log("Product array is"+qaunt_arr[xyz]);                          
                          prod_arr[0].qty = qaunt_arr[index_prodid];
                        console.log(prod_arr);
                        console.log("Akhil");
                        var prod_string_json = JSON.parse(JSON.stringify(prod_arr));
                        final_products = final_products.concat(prod_string_json);
                        console.log("Final Products is "+final_products);
                        console.log(final_products.length);
                        if(final_products.length == bb.length){
                            
                            var result = JSON.parse(JSON.stringify(final_products));
                            res.json(result);
                        }
                        }
                        
                        )
                        .catch(reason => console.log(reason.message));
                    }
            }else{
                var result = {status:"Cart is empty" }
               // res.json("cart is empty")
               res.json(result);

            //   res.send('cart is empty');

            }
    })
});




/* Below is for getting share cart details */

router.get('/share/:share_id', function (req, res, next) {
    var prod_arr;
    var final_products = [];
  //  var emailid = req.params.emailid;
  var share_id = req.params.share_id;
console.log("Inside GET #Sharecart#");
    var cart = db.collection('carts');
        cart.find({share_id:share_id}).toArray(function (err, result) {
            if(result.length > 0){
                console.log("inside loop...1")
                console.log(result[0].products)
                console.log(typeof result[0].products)
                var x = result[0].products;
                var productlist = x.map(function(product) {
                    return product['product_id'];
                });
                console.log("Product list is"+productlist);
                console.log(typeof productlist);
                var quantity = x.map(function(product) {
                    return product['qty'];
                });
                console.log(quantity);
                var qaunt_arr = Array.prototype.slice.call(quantity);

                    const bb = Array.prototype.slice.call(productlist);
                    console.log(
                        Array.isArray(bb) // true
                    );
                    console.log("bb is"+bb); // array of product id's

                    for(var xyz = 0; xyz < bb.length;xyz++){
                        console.log("Starting point XYZ is "+xyz);                        
                        console.log("bb["+xyz+"]"+bb[xyz]);
                        get_products(product_url+"api/game/product/"+bb[xyz])
                        .then(
                          json_string => {console.log("After Fetching Json String"+json_string);
                          var product_array = JSON.parse(JSON.stringify(json_string));
                          console.log("Product Array is");
                          console.log(product_array);
                          prod_arr = Array.prototype.slice.call(product_array);
                          console.log(
                              Array.isArray(prod_arr) // true
                          );
                          function findProdPosition(element) {
                            if (element == prod_arr[0].product_id){
                                return element;
                            }
                          }
                          var game_id = prod_arr[0].product_id;
                          var index_prodid = productlist.findIndex(findProdPosition);
                          console.log("Product array is"+qaunt_arr[xyz]);                          
                          prod_arr[0].qty = qaunt_arr[index_prodid];
                        console.log(prod_arr);
                        console.log("Akhil");
                        var prod_string_json = JSON.parse(JSON.stringify(prod_arr));
                        final_products = final_products.concat(prod_string_json);
                        console.log("Final Products is "+final_products);
                        console.log(final_products.length);
                        if(final_products.length == bb.length){
                            
                            var result = JSON.parse(JSON.stringify(final_products));
                            res.json(result);
                        }
                        }
                        
                        )
                        .catch(reason => console.log(reason.message));
                    }
            }else{
                var result = {status:"Cart is empty" }
                // res.json("cart is empty")
                res.json(result);
              //  res.send('Cart is Empty')

            }
    })
});

router.post('/remove-from-cart', function (req, res, next) {

    var id = req.body.prod_id;
   // console.log('remove cart code is' + id);
    var cart_id = req.body.cartid;

    console.log("id"+id+ "cart_id:"+cart_id);

    var qty = 1;
    var products = [];
    products.push({product_id: id, qty: qty});
    console.log("Inside remove cart:"+products);

    var cart = db.collection('carts');
    cart.findOneAndUpdate({$and:[{cart_id: cart_id},{'products.product_id': id}]}, {$inc: {'products.$.qty': -1}});
console.log('decemented by 1');
res.sendStatus(200);
});

router.post('/deletecart', function (req,res) {
    var cart_id = req.body.cart_id;
    var cart = db.collection('carts');
    console.log("Inside deletecart"+cart_id);
    cart.remove({$and:[{cart_id: cart_id},{share_id:null}]}, function(err) {
        if (!err) {

            console.log("Deleted Successfully!");
            res.sendStatus(200);
        }
        else {
            console.log("Error, not deleted");
            res.sendStatus(500);

        }
    });


})



router.post('/deletesharecart', function (req,res) {
    var cart_id = req.body.cart_id;
    var share_id = req.body.shareid;
    var cart = db.collection('carts');
    console.log("Inside deletecart, share_id is:" + share_id);
    cart.remove({share_id: share_id}, function (err) {
        if (!err) {

            console.log("Deleted Successfully!");
            res.sendStatus(200);
        }
        else {
            console.log("Error, not deleted");
            res.sendStatus(500);

        }
    });
});



module.exports = router;