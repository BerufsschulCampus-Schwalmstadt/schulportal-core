'use strict';

const BootBot = require('bootbot');
const config = require('config');
const schedule = require('node-schedule');
// var TurndownService = require('turndown');
// var turndownService = new TurndownService();
// var markdown = turndownService.turndown('<p><strong>Film Screening | Just Another Accent&nbsp;</strong></p> '+
// '<p><em>Tonight April 5 @ 7:00 PM, A6 Building, room 008</em></p> '+
// '<p><em><strong><a href="http://nyuadi.force.com/Events/NYUEventRegistration?event=J8jmAFmk2GDbDDVrwaos0A_3D_3D">RSVP HERE</a></strong></em></p> '+
// '<p>The documentary aims to raise awareness of stuttering and wipe off the stigma that has long been attached to it. The film also follows Farah Al Qaissieh&rsquo;s journey in supporting the stutter community through her non-profit organization of Stutter UAE and the features other people who stutter and the issues they face in everyday life.</p>'+
// '<p>[Director: Khadija Kudsi &amp; Samia Ali | UAE | 2016 | 15 mins | Arabic w/ English Subtitles]</p>'+
// '<p><em><strong>Screening followed by Q&amp;A with the film&rsquo;s lead star Farah Al Qaissieh</strong></em></p>'+
// '<p>&nbsp;</p>')

const spammerModule = require('./modules/spammer');
const dialogflowModule = require('./modules/dialogflow');

const bot = new BootBot({
  accessToken: config.get('access_token'),
  verifyToken: config.get('verify_token'),
  appSecret: config.get('app_secret'),
});

bot.setGetStartedButton((payload, chat) => {
  chat.getUserProfile()
  .then((user) => {
    chat.say(`Hello, ${user.first_name}! I am the NYUAD Spammer Bot. I am here to help you access Student Portal quickly and efficiently.`)
    .then(() => {
      chat.say('To view the latest updates, subscribe to notifications, or unsubscribe from them, just click the buttons from the menu.', { typing: true });
    });
  });

  //ask for updates
  var j = schedule.scheduleJob('*/5 * * * * *', function(){
    chat.say('asdfasdf');
  });

});

bot.setPersistentMenu([
  {
    title: 'About',
    type: 'postback',
    payload: 'MENU_ABOUT'
  },
  {
    title: 'Subscribe',
    type: 'postback',
    payload: 'MENU_SUBSCRIPTION'
  },
  {
    title: 'Unsubscribe',
    type: 'postback',
    payload: 'MENU_UNSUBSCRIPTION'
  }
]);

bot.module(spammerModule);
bot.module(dialogflowModule);

bot.start(process.env.PORT || 3000);
