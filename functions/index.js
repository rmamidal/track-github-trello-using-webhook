const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require("express");
const engines = require('consolidate');
const request  = require('request');
require('dotenv').config()
const TrelloWebhookServer = require('./src/webhook-server');
const trelloWHServer = new TrelloWebhookServer({
    port: "3200",
    hostURL: "https://gitbub-trello-webhook.firebaseapp.com",
    apiKey: "9a6e85bc9f803b92b1b0211a7a99778b",
    apiToken: "022a033fb4e49469f76462183dce0706c0000b6ec41f69af731e70063194dbd2",
    clientSecret: "c937d4ba4d554af6fb99fcf3ecfeb8de7f3a57883503b80e2f7aa0785087ed76"
  });
  trelloWHServer.start('59edd17a48fa712db6465109')
  .then(webhookID => {
    console.log(`Webhook ID: ${webhookID}`);

    trelloWHServer.on('data', event => {
      console.log('Got stuff from Trello!');
    });
  })
  .catch(e => {
    console.log('Error getting Trello webhook');
    console.log(e);
  });


//trello credentials.
const apiKey = "9a6e85bc9f803b92b1b0211a7a99778b";
const apiToken = "022a033fb4e49469f76462183dce0706c0000b6ec41f69af731e70063194dbd2";

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);
function getFacts() {
    const ref =  firebaseApp.database().ref('user');

    return ref.once('value').then(snap => snap.val());
}
const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.get("/", (req, res) => {
    res.set('Cache-Control','public, max-age=300, s-max-age=600');
    getFacts().then(facts => {
        //resp.send(`${Date.now()}`);
        res.send({facts});
     //   resp.render('index',{facts});
       // resp.render('index',{facts: `${Date.now()}`});
    });
});

//Code to update the user card
app.get("/webhooks", (req, res, next) => {
    res.set('Cache-Control','public, max-age=300, s-max-age=600');
    var path = 'https://api.trello.com/1/cards/59edd193c57ab29600697743/name?key=' + apiKey + '&token=' + apiToken;
     request(
            {
                method: 'PUT',
                uri: path,
                body: {value: 'I am able get the id of the board and Card...'},
                json: true 
            },
            function (error, response, body) {
                if(response.statusCode == 200){
                   return "successfully updated card";
                } else {
                    console.log('error: '+ response.statusCode);
                    console.log(body);
                }
            });
    res.send("OK");
});

//Code to register webhooks.
app.get("/registerWebhook", (req, res, next) => {
   // var path = 'https://api.trello.com/1/members/59b8f61fbab15b32ae120fbe/actions?key=' + key + '&token=' + token;
    var path = 'https://api.trello.com/1/token/'+ apiToken+'/webhooks/?key='+apiKey;
            request.post('https://api.trello.com/1/webhooks', {
                body: {
                  description: 'Trello Webhook Server',
                  callbackURL: 'https://gitbub-trello-webhook.firebaseapp.com/trelloUser',
                  idModel: "59edd17a48fa712db6465109",
                  key: apiKey,
                  token: apiToken
                },
                json: true
              }, (err, res, body) => {
                if (err) {
                  reject(err);
                } else if (typeof body === 'string') {
                  if (body === 'A webhook with that callback, model, and token already exists') {
                    console.log(body);
                  } else {
                    console.log('Body ID: '+body);
                  }
                } else {
                  this.webhookID = body.id;
                  console.log('Webhook ID: '+body.id);
                }
              });
    res.send(path);
});

//Code to get user activity on board.
app.get("/trelloUserWebhook", (req, res, next) => {
    //res.set('Cache-Control','public, max-age=300, s-max-age=600');
   // var path = 'https://api.trello.com/1/members/59b8f61fbab15b32ae120fbe/actions?key=' + apiKey + '&apiToken=' + apiToken;
  // var dept = req.body;
  // res.json(`Departments Added : ${req.body} `)
  // console.log(dept);
   res.send(req.body);
    
});
exports.app = functions.https.onRequest(app);
