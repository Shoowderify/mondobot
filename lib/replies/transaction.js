require('dotenv').config()
var mondo = require('mondo-bank');
var mondoToken = process.env.mondo_token;
var helpers = require('../helpers.js');
var chrono = require('chrono-node');
module.exports = function(bot, message){
  bot.botkit.log("transaction");
  console.log(bot);
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'thinking_face',
  },function(err,res) {
    if (err) {
      bot.botkit.log("soz no emoji lulz",err);
    }
  });
  var parsed = chrono.parse(message.text);
  var holder = "I'm working man... :man_in_business_suit_levitating:";
  bot.reply(message, holder, function(){
    mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Your account belongs to: " + value.accounts[0].description + ", id: " + account_id;
        bot.reply(message, text, function(){
          mondo.transactions(account_id, mondoToken, function(err, value){
            console.log(err);
            var text = value.transactions.map(function(transaction, index){
              return index + 1 + ". transaction: " + transaction.description + ", " + transaction.description + ", " + helpers.formatGBP(transaction.amount);
            }).join("\n");
            bot.reply(message, text);
            bot.api.reactions.remove({
              timestamp: message.ts,
              channel: message.channel,
              name: 'thinking_face',
              },function(err,res) {
              if (err) {
                bot.botkit.log("soz i failed",err);
              }
            }); 
            bot.reply(message,{
                text: ":smoking: simple.",
                icon_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
                username: "Barney",
                image_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
              });
          });
        });
      }
      else {
        bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'slightly_frowning_face',
          },function(err,res) {
          if (err) {
            bot.botkit.log("soz no emoji lulz",err);
          }
          });
        bot.reply(message, "you have no transactions LOL go spend dat moniez $$$");
      }
    });    
  });
}