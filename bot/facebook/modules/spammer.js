'use strict';

var sqlite3 = require('sqlite3').verbose();
var db;

// var TurndownService = require('turndown');
// var turndownService = new TurndownService();
// var markdown = turndownService.turndown('<p><strong>Film Screening | Just Another Accent&nbsp;</strong></p> '+
// '<p><em>Tonight April 5 @ 7:00 PM, A6 Building, room 008</em></p> '+
// '<p><em><strong><a href="http://nyuadi.force.com/Events/NYUEventRegistration?event=J8jmAFmk2GDbDDVrwaos0A_3D_3D">RSVP HERE</a></strong></em></p> '+
// '<p>The documentary aims to raise awareness of stuttering and wipe off the stigma that has long been attached to it. The film also follows Farah Al Qaissieh&rsquo;s journey in supporting the stutter community through her non-profit organization of Stutter UAE and the features other people who stutter and the issues they face in everyday life.</p>'+
// '<p>[Director: Khadija Kudsi &amp; Samia Ali | UAE | 2016 | 15 mins | Arabic w/ English Subtitles]</p>'+
// '<p><em><strong>Screening followed by Q&amp;A with the film&rsquo;s lead star Farah Al Qaissieh</strong></em></p>'+
// '<p>&nbsp;</p>')

module.exports = (bot) => {

  const doNothing = (convo) => {
    return;
  }

  const addSubscriptionsToTable = (convo) => {

    function openDatabase(){
      //Open database
      console.log("Open Database");
      db = new sqlite3.Database('./database/spammerDatabase.db');
    }

    function insertToUserTable(){
      //Inserting for the first time into user table
      console.log("Inserting into user table");
      var user = db.prepare("INSERT OR IGNORE INTO users VALUES (?, ?)");
      user.run(convo.get('userID'), '0');
      user.finalize(readUserValues);
    }

    function readUserValues(){
      //Reading user table values
      console.log("Printing user table values");
      db.all("SELECT userid, timestamp FROM users", function(err, rows) {
          rows.forEach(function (row) {
              console.log(row.userid + ": " + row.timestamp);
          });
      });
    }

    function insertToSubscriptionTable(){
      //Getting the categoryid from categories table
      var newlist = [];
      var fields = convo.get('fields');
      var fieldList = fields.split(',');
      var categoryid;

      for (var i=0; i<fieldList.length; i++){
        let string = fieldList[i];

        db.each("SELECT categoryid FROM categories WHERE categoryString = ?", [string], (err, row) => {

          if (err){
            convo.say("Something went wrong, please try again by clicking the subscribe button from the menu.", { typing:true });
            convo.end();
          }

          newlist.push(`${row.categoryid}`);

          //need to check for values that are not in categories

          if (newlist.length == fieldList.length){
            categoryid = newlist.join(',');

            //Inserting for the first time into user subscription table
            console.log("Inserting into user subscription Table");
            var subscription = db.prepare("INSERT OR REPLACE INTO userSubscription VALUES (?, ?)");
            subscription.run(convo.get('userID'), categoryid);

            convo.say("Perfect, you are now subscribed to: " + fields.replace(/,/g, ', '), { typing:true });
            subscription.finalize(readUserSubscriptionValues);
          }

        });
      }
    }

    function readUserSubscriptionValues(){
      console.log("Printing user subscription values");
      db.all("SELECT userid, categoryid FROM userSubscription", function(err, rows) {
          rows.forEach(function (row) {
              console.log(row.userid + ": " + row.categoryid);
          });
      });
    }

    function closeDatabase(){
      console.log("Close database");
      db.close();
    }

    openDatabase();
    insertToUserTable();
    insertToSubscriptionTable();
    closeDatabase();

    return;
  }

  const updateCategories = (convo) => {

    convo.ask(doNothing, (payload, convo) => {

      const userFields = payload.message.text;
      const updatedFields = userFields.toLowerCase().replace(/\s/g, '');
      convo.set('fields', updatedFields);

      addSubscriptionsToTable(convo);
      convo.end();

    });
  };

  bot.on('postback:MENU_UPDATE_SUBSCRIPTION', (payload, chat) => {
    const userID = payload.sender.id;

    chat.conversation((convo) => {
      convo.set('userID', userID);

      chat.say('Our current categories are: student life, athletics, and resed', { typing:true });
      chat.say('Type all the names of the categories you wish to be subscribed to separated by commas. (ex. studentlife, athletics). This information will be updated everytime you chose to subscribe.', { typing: true });

      updateCategories(convo);
      return;
    });
  });

};
