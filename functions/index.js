const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require("express");
const engines = require('consolidate');
const request  = require('request');

//trello credentials.
const key = "9a6e85bc9f803b92b1b0211a7a99778b";
const token = "022a033fb4e49469f76462183dce0706c0000b6ec41f69af731e70063194dbd2";

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
    var path = 'https://api.trello.com/1/cards/59edd193c57ab29600697743/name?key=' + key + '&token=' + token;
     request(
            {
                method: 'PUT',
                uri: path,
                body: {value: 'I am able get the id of the board and Card'},
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


//Code to get user activity on board.
app.get("/trelloUser", (req, res, next) => {
    res.set('Cache-Control','public, max-age=300, s-max-age=600');
    var path = 'https://api.trello.com/1/members/59b8f61fbab15b32ae120fbe/actions?key=' + key + '&token=' + token;
    var output= request(
            {
                method: 'GET',
                uri: path,
                json: true 
            },
            function (error, response, body) {
                if(response.statusCode == 200){
                    console.log(body);
                } else {
                    console.log('error: '+ response.statusCode);
                    console.log(body);
                }
            });
    res.send(output);
});
exports.app = functions.https.onRequest(app);
