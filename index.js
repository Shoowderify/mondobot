require('dotenv').config();
// mondo.token({
//     client_id: process.env.mondo_client_id,
//     client_secret: process.env.mondo_client_secret,
//     username: process.env.mondo_username,
//     password: process.env.mondo_password
//   }, 
//   function(err, value){
//     //value is the token here
//     //Do some stuff :)
//   }
// );

if (!process.env.slack_token) {
    console.log('Error: Specify Slack token in environment');
    process.exit(1);
}
if (!process.env.mondo_token) {
    console.log('Error: Specify Mondo token in environment');
    process.exit(1);
}

var mondo = require('mondo-bank');
var Botkit = require('botkit');

var mondoToken = process.env.mondo_token;

var controller = Botkit.slackbot({
    debug: true,
});

var webshot = require('webshot');
var fs      = require('fs');
var d3			= require('d3'),
		jsdom		= require('jsdom');


var helpers = require('./lib/helpers.js');

var bot = controller.spawn({
    token: process.env.slack_token
}).startRTM();

controller.on('bot_channel_join', function(bot, message){
    bot.say({
        channel: message.channel,
        text: "Hello I'm your MondoBot!!!"
    });
});

controller.hears(['hello','hi'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "hello");
});

controller.hears(['hey'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "I just met you... \n and this is crazy \n here's my :1234: \n :calling: maybe?");
});

controller.hears(['node'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "THE 1 TRU3 D£V LANG");
});

//spambot
controller.hears(['mondo'], 'ambient', require('./lib/replies/mondoTroll.js'));


//this is where the API integration starts

//accounts
controller.hears(['account', 'accounts'], 'direct_message,direct_mention,mention', require('./lib/replies/account.js'));

//balance command
controller.hears(['balance(.*)'], 'direct_message,direct_mention,mention', require('./lib/replies/balance.js'));

//transactions command
controller.hears(['transactions'], 'direct_message,direct_mention,mention', require('./lib/replies/transaction.js'));


// data viz

controller.hears(['show me where i spend the most money'], 'direct_message,direct_mention,mention', function(bot, message){
	bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'thinking_face',
  },function(err,res) {
    if (err) {
      bot.botkit.log("soz no emoji lulz",err);
    }
  });
	bot.reply(message, "hold on", function(){
		mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Account: " + value.accounts[0].description + ", id: " + account_id;
        bot.reply(message, text, function(){
          mondo.transactions(account_id, mondoToken, function(err, value){
          	// adapt from http://bl.ocks.org/mbostock/4063269
            var diameter = 960,
						    format = d3.format(",d"),
						    color = d3.scale.category20c();

						var bubble = d3.layout.pack()
						    .sort(null)
						    .size([diameter, diameter])
						    .padding(1.5);

						var document = jsdom.jsdom(),
						    svg = d3.select(document.body).append("svg")
						    .attr("width", diameter)
						    .attr("height", diameter)
						    .attr("class", "bubble");


						// value.transactions needs to be parsed
						d3.json(value.transactions, function(error, root) {
						  if (error) throw error;

						  var node = svg.selectAll(".node")
						      .data(bubble.nodes(classes(root))
						      .filter(function(d) { return !d.children; }))
						    .enter().append("g")
						      .attr("class", "node")
						      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

						  node.append("title")
						      .text(function(d) { return d.className + ": " + format(d.value); });

						  node.append("circle")
						      .attr("r", function(d) { return d.r; })
						      .style("fill", function(d) { return color(d.packageName); });

						  node.append("text")
						      .attr("dy", ".3em")
						      .style("text-anchor", "middle")
						      .text(function(d) { return d.className.substring(0, d.r / 3); });
						});

						// Returns a flattened hierarchy containing all leaf nodes under the root.
						function classes(root) {
						  var classes = [];

						  function recurse(name, node) {
						    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
						    else classes.push({packageName: name, className: node.name, value: node.size});
						  }

						  recurse(null, root);
						  return {children: classes};
						}

						d3.select(self.frameElement).style("height", diameter + "px");


            bot.reply(message, function(){
            	webshot(document, 'hello_world.png', {siteType:'html'}, function(err) {
							  // screenshot now saved to hello_world.png 
							});
							// stream the screenshot to Slack
       //      	var renderStream = webshot(document);
							// var file = fs.createWriteStream('test.png', {encoding: 'binary'});
							 
							// renderStream.on('data', function(data) {
							//   file.write(data.toString('binary'), 'binary');
							// });
            });
            bot.reply(message, renderStream);
            bot.reply(message, file);
            bot.api.reactions.remove({
					    timestamp: message.ts,
					    channel: message.channel,
					    name: 'thinking_face',
					    },function(err,res) {
					    if (err) {
					      bot.botkit.log("soz i failed",err);
					    }
					  }); 
					});
        });
		}
		});
	});
});