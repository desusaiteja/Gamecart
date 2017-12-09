var express = require('express');
const fetch = require('node-fetch');
const csrf = require('express-csurf');
var passport = require('passport');
var shortid = require('shortid');

//This is to enable the session protection from being stolen
//var csrfProtection = csrf();

var router = express.Router();

share_id = shortid.generate();
console.log("Share_id for this execution is:"+share_id);
shareflag = 0;
console.log("starting Share flag is:"+shareflag);
const headers = {
  'Accept': 'application/json'
};

//router.use(csrfProtection);

//this URL is on which the product catalogue API is running on
const product_url = "http://localhost:8080/"
console.log("Product URL is"+product_url);

//This URL is for cart
const cart_url = "http://localhost:3030/"
console.log("Cart URL is"+cart_url);


//This URL is for recommendation functionality
const recommend_url = "http://localhost:5000/"

/* GET home page. */
router.get('/'/*, ensureAuthenticated */, function(req, res, next) {
  console.log("Inside the get home page");
  console.log(req.session.email);
  get_products(product_url+"api/games")
  .then(
    json_string => {console.log("After Fetching Json String"+json_string);
    var product_array = JSON.parse(JSON.stringify(json_string));
  //  console.log("Product Array is"+JSON.stringify(product_array));
    /*var*/ productChunk = [];
    var chunkSize = 3;
    for(i=0;i<product_array.length;i += chunkSize) {
      productChunk.push(product_array.slice(i,i + chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart' ,products: productChunk})
  }
  )
  .catch(reason => console.log(reason.message));
});

//Function to check whether user logged In
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next();
  } else {
      //res.send('Please Log in');
      //req.flash('error_msg','You are not logged in');
      res.render('user/signin');
  }
}

/*Below is for Recommendations*/
router.get('/recommendations'/*, ensureAuthenticated */, function(req, res, next) {
    console.log("Inside the get recommendations");
    //console.log(req.session.email);
    get_recommendations(recommend_url+"rsprods")
        .then(
            json_string => {console.log("After Fetching Json String"+json_string);
    var product_array = JSON.parse(JSON.stringify(json_string));
  //  console.log("Product Array is"+JSON.stringify(product_array));
    productChunk = [];
    var chunkSize = 3;
    for(i=0;i<product_array.length;i += chunkSize) {
        productChunk.push(product_array.slice(i,i + chunkSize));
    }
    res.render('shop/recommend', { title: 'Shopping Cart' ,products: productChunk, shareurl:'New Products'})
}
)
.catch(reason => console.log(reason.message));
});

const get_recommendations = async url=>{
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

/* This is for handling add to cart */
router.get('/addcart/:prodid', ensureAuthenticated, function(req, res, next) {
  console.log("Inside the add to cart route");
  console.log(req.session.email);
  var prod_id = req.params.prodid;
  console.log("Product ID being added to cart"+prod_id);
  console.log("Inside adding cart, Share flag is:"+shareflag);
  /* Share cart logic */
  if(shareflag==0){
    console.log("Inside adding cart, if share flag==0, Share flag is:"+shareflag);
  body = {
    email : req.session.email,
    prodid : prod_id
  }
fetch(cart_url+"add-to-cart/"/* +prod_id */, {
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
  res.redirect("/");
});
  }
  else{
    console.log("Inside adding cart, if share flag==1, Share flag is:"+shareflag);
    body = {
      email : req.session.email,
      prodid : prod_id,
      share_id: share_id
    }
  fetch(cart_url+"add-to-sharecart/"/* +prod_id */, {
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
    res.redirect("/share/"+share_id);
  });
  }
});

/* For identifying share cart button clicked, accordingly share flag changes to 1 */

router.get('/shareid', function(req,res){
  console.log("Inside shareid api");
  shareflag = 1;
  console.log("Inside share id api shareid is:"+share_id);
 // res.render('shop/index', { title: 'Shopping Cart' ,products: productChunk, shareurl:'http://localhost:3000/share/'+share_id})
    res.redirect('/share/'+share_id);
})


/* Getting share cart product catalog*/

router.get('/share/:share_id',ensureAuthenticated, function(req,res){
var share_id = req.params.share_id;
//shareflag = 1; //making sure to add into share cart
res.render('shop/index', { title: 'Shopping Cart' ,products: productChunk, shareurl:'http://localhost:3000/share/'+share_id});
});

/* Getting Sharecart checkout */

router.get('/sharecart/:share_id',ensureAuthenticated, function(req,res){
  var share_id = req.params.share_id;
  //shareflag = 1; //making sure to add into share cart
  get_cart_items(cart_url+"share/"+share_id).then(
    json_string => {
      var share_cart_array = JSON.stringify(json_string);
      console.log("share cart is:"+JSON.stringify(share_cart_array.qty));
      res.render('shop/shopping-cart', { products: json_string});
    }
  )
  
  });
/* For navigating to shared shopping cart */

  
  router.get('/sharenavigate', function(req,res){
  //  var share_id = req.params.share_id;
 //   shareflag = 1; //making sure to add into share cart
    res.redirect('/sharecart/'+share_id);
    });

router.get('/shopping-cart/', function(req,res){
    shareflag = 0;
  get_cart_items(cart_url+"shopping-cart/"+req.session.email)
  .then(
    json_string => {
    var cart_array = JSON.stringify(json_string);
   // var cart = JSON.parse(json_string);
   // console.log("cart price:"+cart[0].price);
  //  console.log("Product Array2 is"+cart_array[0][0].price);
    /*Total = 0;
    for(var i=0;i<cart_array.length;i++){
      Total = Total + cart_array[i].price
      console.log('Total:'+Total);
    }
*/
    res.render('shop/shopping-cart', { products: json_string})
  }
  )
});

const get_cart_items = async url=>{
  try{
    const response = await fetch(url);
    json = await response.json();
    console.log("JSON Object is "+json);
    return json;
  }
  catch(error){
    console.log("Error inside the product fetching"+error);
  }
}


router.post('/checkout', function (req,res) {
var cart_id = req.session.email;
var shareid = share_id;
body = { cart_id: cart_id, shareid:shareid};
console.log("shareflag inside checkout"+shareflag);
console.log("shareid inside checkout:"+shareid);

if(shareflag==0) {
    console.log("shareflag inside delete"+shareflag);
    fetch(cart_url + "deletecart"/* +prod_id */, {
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
    }).then(function (body) {
        console.log(body);
        console.log("Inside post Response for share cart");
        res.redirect("/orderplaced");
    });
}
else
{
    body = { cart_id: cart_id, shareid:shareid};
    console.log("shareflag inside deleteshare"+shareflag);
    console.log("shareid inside deleteshare"+shareid);
    fetch(cart_url + "deletesharecart"/* +prod_id */, {
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
    }).then(function (body) {
        console.log(body);
        console.log("Inside post Response for share cart");
        res.redirect("/orderplaced");
    });
}
}

)

router.get('/orderplaced', function (req,res) {
res.render("shop/orderplaced");
})


router.post('/admin', function (req,res) {
    var body = req.body;


    fetch('http://localhost:8080/api/games', {
        method: 'POST',
        headers: {
            headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(function (res) {

        return res.json();

    }).then(function(json) {
        console.log("Response from prod cat api"+json);
        res.redirect("/");
    });
});


//})


router.get('/removeone/:id', function (req,res) {

  var prodid = req.params.id;
  var cartid = req.session.email;

    body = { prod_id: prodid, cartid: cartid};

    fetch(cart_url+"remove-from-cart/"/* +prod_id */, {
        method: 'POST',
        headers: {
            headers,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(function (res) {
        //  console.log(res.json());
       // return res.json();
        return res.text();
         }).then(function(body) {
            console.log(body);

          res.redirect('/shopping-cart/');
         });


})

module.exports = router;


