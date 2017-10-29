
//---------------------------------------------signup page call------------------------------------------------------
exports.states = function(req, res){
   message = '';
   if(req.method == "POST"){
      // var bcrypt = require('bcrypt');
      var post = req.body;
      console.log(post);
      var state= post.state;
      var sql = "SELECT * FROM users WHERE homeState= '"+state+"'";
      var query = db.query(sql, function(err, result) {
        message = "Success! Your account has been created.";
        //res.render('signup.ejs',{message: message});
        console.log(result);
      });

   } else {
      //res.render('signup');
   }
};

//-----------------------------------------------login page call------------------------------------------------------
exports.getOfficials = function(req, res){
    if(req.method == "GET"){
      var bcrypt = require('bcrypt');
      var post  = req.body;
      console.log(req);
    }


};
//-----------------------------------------------dashboard page functionality----------------------------------------------
