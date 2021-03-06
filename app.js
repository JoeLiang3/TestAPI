/**
* Module dependencies.
*/
///
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , members = require('./routes/members')
  , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
// var bcrypt = require('bcrypt');
// var salt = bcrypt.genSaltSync(10);
var mysql = require('mysql');
var fs = require("fs");
var request = require('request');
var bodyParser=require("body-parser");
var Congress = require( 'propublica-congress-node' );
var client = new Congress( 'RmrxLK9M6LrHgHTjMbuoIy1sEg5nPhMMx52J4HAe' );
var cors = require('cors')
var con = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'rippleDB',
              multipleStatements: true
              // host     : 'us-cdbr-iron-east-05.cleardb.net',
              // user     : 'be9dbda2b18efa',
              // password : 'f5254516',
              // database : 'heroku_44af54f55baae38',
              // multipleStatements: true
            });


global.db = con;

// all environments
app.use(cors());
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
var state_abbrev = {
        "AL":"Alabama",   "AK":"Alaska",   "AZ":"Arizona",   "AR":"Arkansas",   "CA":"California",   "CO":"Colorado",
        "CT":"Conneticut",   "DE":"Delaware",   "FL":"Florida",   "GA":"Georgia",   "HI":"Hawaii",   "ID":"Idaho",   "IL":"Illinois",
        "IN":"Indiana",   "IA":"Iowa",   "KS":"Kansas",   "KY":"Kentucky",   "LA":"Louisiana",   "ME":"Maine",   "MD":"Maryland",
        "MA":"Massachusetts",   "MI":"Michigan",   "MN":"Minnesota",   "MS":"Mississippi",   "MO":"Missouri",   "MT":"Montana",
        "NE":"Nebraska",   "NV":"Nevada",   "NH":"New Hampshire",   "NJ":"New Jersey",   "NM":"New Mexico",   "NY":"New York",
        "NC":"North Carolina",   "ND":"North Dakota",   "OH":"Ohio",   "OK":"Oklahoma", "OR":"Oregon",   "PA":"Pennsylvania",
        "RI":"Rhode Island",   "SC":"South Carolina",   "SD":"South Dakota",   "TN":"Tennessee",   "TX":"Texas",   "UT":"Utah",
        "VT":"Vermont",   "VA":"Virginia",   "WA":"Washington",   "WV":"West Virginia",   "WI":"Wisconsin",   "WY":"Wyoming"};

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

  con.query("DROP TABLE IF EXISTS house_members; \ CREATE TABLE house_members ( \
            id int NOT NULL AUTO_INCREMENT, \ photo varchar(255) NOT NULL default '', \
            firstName varchar(255) NOT NULL default '', \ lastName varchar(255) NOT NULL default '', \
            party varchar(255) NOT NULL default '', \ homeState varchar(255) NOT NULL default '', \
            phoneNum varchar(255) NOT NULL default '', \ position varchar(255) default 'House of Rep.', \
            PRIMARY KEY (id))ENGINE=INNODB;",
  function (err, result) {
    if (err) throw err;
    console.log("House table created");
  });

  client.memberLists({
    congressNumber: '115',
    chamber: 'house',
    responseFormat: '.json'
  }).then(function(res) {
    num_members = res.results[0].num_results;
    for(var n = 0; n < num_members; n++)
    {
      firstName= (res.results[0].members[n].first_name).replace("'", "''");
      lastName= (res.results[0].members[n].last_name).replace("'", "''");
      partyAffil= (res.results[0].members[n].party=="D") ? "Democrat" : "Republican";
      state= state_abbrev[res.results[0].members[n].state];
      phone= (res.results[0].members[n].phone);
      bioguide= (res.results[0].members[n].id);
      var sql = "INSERT INTO house_members (photo,firstName,lastName,party,homeState,phoneNum) "
                +"VALUES ('"+bioguide+"', '"+firstName+"', '"+lastName+"', '"+partyAffil+"', '"+state+"', '"+phone+"')";
      con.query(sql, function (err, result) {
        if (err) console.log(err);
      });
    }
    console.log("House table filled");
  });

  con.query("DROP TABLE IF EXISTS senate_members; \ CREATE TABLE senate_members ( \
            id int NOT NULL AUTO_INCREMENT, \ photo varchar(255) NOT NULL default '', \
            firstName varchar(255) NOT NULL default '', \ lastName varchar(255) NOT NULL default '', \
            party varchar(255) NOT NULL default '', \ homeState varchar(255) NOT NULL default '', \
            phoneNum varchar(255) NOT NULL default '', \ position varchar(255) default 'Senator', \
            PRIMARY KEY (id))ENGINE=INNODB;",
  function (err, result) {
    if (err) throw err;
    console.log("Senate table created");
  });

  client.memberLists({
    congressNumber: '115',
    chamber: 'senate',
    responseFormat: '.json'
  }).then(function(res) {
    num_members = res.results[0].num_results;
    for(var n = 0; n < num_members; n++)
    {
      firstName= (res.results[0].members[n].first_name).replace("'", "''");
      lastName= (res.results[0].members[n].last_name).replace("'", "''");
      partyAffil= (res.results[0].members[n].party=="D") ? "Democrat" : "Republican";
      state= state_abbrev[res.results[0].members[n].state];
      phone= (res.results[0].members[n].phone);
      bioguide= (res.results[0].members[n].id);
      var sql = "INSERT INTO senate_members (photo,firstName,lastName,party,homeState,phoneNum) "
                +"VALUES ('"+bioguide+"', '"+firstName+"', '"+lastName+"', '"+partyAffil+"', '"+state+"', '"+phone+"')";
      con.query(sql, function (err, result) {
        if (err) console.log(err);
      });
    }
    console.log("Senate table filled");
  });

  con.query("CREATE TABLE IF NOT EXISTS users ( \
            id int NOT NULL AUTO_INCREMENT, \ first_name text NOT NULL,\
            last_name text NOT NULL, \ email text NOT NULL,\
            user_name varchar(20) NOT NULL, \ password varchar(255) NOT NULL,\
            PRIMARY KEY (id)) ENGINE=INNODB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;",
  function (err, result) {
    if (err) throw err;
    console.log("User table created");
  });

  con.query("DROP TABLE IF EXISTS bills; \ CREATE TABLE bills ( \
            id int NOT NULL AUTO_INCREMENT, \ billID varchar(255) NOT NULL default '', \ type varchar(255) NOT NULL default '', \
            Bnumber varchar(255) NOT NULL default '', \ title text NOT NULL, \
            sponsorTitle varchar(255) NOT NULL default '', \ sponsor varchar(255) NOT NULL default '', \
            sponsorId varchar(255) NOT NULL default '', \ sponsorState varchar(255) NOT NULL default '', \
            partyAffil varchar(255) NOT NULL default '', \ sponsorUri varchar(255) NOT NULL default '', \
            gpoPdf varchar(255) NOT NULL default '', \ congressUrl varchar(255) NOT NULL default '', \
            govtrackUrl varchar(255) NOT NULL default '', \ isActive varchar(255) NOT NULL default '', \
            lastDate varchar(255) NOT NULL default '', \ housePassage varchar(255) NOT NULL default '', \
            senatePassage varchar(255) NOT NULL default '', \ isEnacted varchar(255) NOT NULL default '', \
            isVetoed varchar(255) NOT NULL default '', \ coSponsors varchar(255) NOT NULL default '', \
            committees varchar(255) NOT NULL default '', \ committeeCodes varchar(255) NOT NULL default '', \
            subCommitteeCodes varchar(255) NOT NULL default '', \ primarySubject varchar(255) NOT NULL default '', \
            description varchar(255) NOT NULL default '', \ shortDescription varchar(255) NOT NULL default '', \
            latestMajorAction varchar(255) NOT NULL default '', \ PRIMARY KEY (id))ENGINE=INNODB;",
  function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });

  client.billsRecent({
      congressNumber: '115',
      chamber: 'house',
      bill_type:'updated'
  }).then(function(res) {
      num_bills = res.results[0].num_results;
      for(var n = 0; n < num_bills; n++)
      {
        billID= (res.results[0].bills[n].bill_id);
        type= (res.results[0].bills[n].bill_type);
        Bnumber= (res.results[0].bills[n].number);

        title= (res.results[0].bills[n].title).replace("'", "''");
        //   BillSponsorTitle= (res.results[0].bills[n].sponsor_title);
        sponsor= (res.results[0].bills[n].sponsor_name).replace("'", "''");

        sponsorId= (res.results[0].bills[n].sponsor_id);
        sponsorState= (res.results[0].bills[n].sponsor_state);
        partyAffil= (res.results[0].bills[n].sponsor_party=="D") ? "Democrat" : "Republican";

        sponsorUri= (res.results[0].bills[n].sponsor_uri);
        gpoPdf= (res.results[0].bills[n].bill_gpo_pdf_uri);
        congressUrl= (res.results[0].bills[n].sponsor_id);

        govtrackUrl= (res.results[0].bills[n].govtrack_url);
        isActive= (res.results[0].bills[n].active);
        lastDate= (res.results[0].bills[n].latest_major_action_date);

        housePassage= (res.results[0].bills[n].house_passage);
        senatePassage= (res.results[0].bills[n].senate_passage);
        isEnacted= (res.results[0].bills[n].enacted);

        isVetoed= (res.results[0].bills[n].vetoed);
        coSponsors= (res.results[0].bills[n].cosponsors);
        committees= (res.results[0].bills[n].committees);

        committeeCodes= (res.results[0].bills[n].committee_codes);
        subCommitteeCodes= (res.results[0].bills[n].subcommittee_codes);
        primarySubject= (res.results[0].bills[n].primary_subject);

        description= (res.results[0].bills[n].summary);
        shortDescription= (res.results[0].bills[n].summary_short);
        //BillLatestMajorAction= (res.results[0].bills[n].latest_major_action);

        var sql = "INSERT INTO bills(billID,type,Bnumber,title,sponsor,sponsorId,sponsorState,"+
                    "partyAffil,sponsorUri,gpoPdf,congressUrl,govtrackUrl,isActive,lastDate,"+
                    "housePassage,senatePassage,isEnacted,isVetoed,coSponsors,committees,committeeCodes,"+
                    "subCommitteeCodes,primarySubject,description,shortDescription) "+
                    "VALUES ('"+billID+"', '"+type+"', '"+Bnumber+"', '"+title+"', '"+sponsor+"', '"+sponsorId+"', '"
                    +sponsorState+"', '"+partyAffil+"','"+sponsorUri+"', '"+gpoPdf+"', '"+congressUrl+"', '"
                    +govtrackUrl+"', '"+isActive+"', '"+lastDate+"','"+housePassage+"', '"+senatePassage+"', '"
                    +isEnacted+"', '"+isVetoed+"', '"+coSponsors+"', '"+committees+"','"+committeeCodes+"','"
                    +subCommitteeCodes+"', '"+primarySubject+"', '"+description+"', '"+shortDescription+"')";
        con.query(sql, function (err, result) {
        if (err) console.log(err);
      });
    }
    console.log("Bills table filled");
  });

// development only

app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
app.get('/members/:state',(req, res) => {
  // Get state name from url
  var state = req.params.state;

  // QUERY DATABASE based on URL
  var sql = "SELECT * FROM house_members WHERE homeState= '"+state+"'";
  var query = db.query(sql, function(err, result) {
    if(err) {
      console.log(err);
    }
    // Send back an array of objects
    var membersResult = [result.length];
    var i = 0;
    result.forEach((member) => {
      var member = {
        name: member.firstName + member.lastName,
        id: member.id,
        party: member.party,
        homeState: member.homeState,
        phone: member.phoneNum,
        position: member.position,
      }
      membersResult[i] = member;
      i++;
    });
    res.send({membersResult})
  });
});
//Middleware

var port = process.env.PORT || 3000;
app.listen(port);
