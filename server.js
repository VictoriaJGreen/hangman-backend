const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express');
const WebSocket = require('ws');
const model = require('./model.js');

// app & middleware setup
var app = express();
app.set("port", (process.env.PORT || 8080)) //getting port from the operating system
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// let server = app.listen(8080, () => {
let server = app.listen(app.get('port'), () => {
  console.log("Server is listening.");
});

// Websocket stuff
const wss = new WebSocket.Server({server: server});

var playerOne = null;
var playerTwo = null;

var GeneratedMagicWord = null;

const compareLetterToWord = function(clientData) {
  console.log("here I would compare letter to word. Letter is", clientData.letter)
  // console.log(clientData.guesser);
  var activeLetters = {
    firstLetter: null,
    secondLetter: null,
    thirdLetter: null,
    fourthLetter: null,
    fifthLetter: null,
    sixthLetter: null,
  }

  for (var i = 0; i < GeneratedMagicWord.length; i++) {
    console.log(GeneratedMagicWord[i])
    console.log(i)
    if (GeneratedMagicWord[i] == clientData.letter && i == 0){
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.firstLetter = clientData.letter;
    } else if (GeneratedMagicWord[i] == clientData.letter && i == 1) {
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.secondLetter = clientData.letter;
    } else if (GeneratedMagicWord[i] == clientData.letter && i == 2) {
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.thirdLetter = clientData.letter;
    } else if (GeneratedMagicWord[i] == clientData.letter && i == 3) {
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.fourthLetter = clientData.letter;
    } else if (GeneratedMagicWord[i] == clientData.letter && i == 4) {
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.fifthLetter = clientData.letter;
    } else if (GeneratedMagicWord[i] == clientData.letter && i == 5) {
      console.log("index is", i, "letter guess matches index. The letter is: ", clientData.letter)
      activeLetters.sixthLetter = clientData.letter;
    }
  }

  console.log("active letters", activeLetters)

  var activeWord = {
    type: "activeWord",
    activeLetters: activeLetters
  }

  // var playerTurn = null
  // if (clientData.guesser == "playerOne"){
  //   playerTurn = "playerTwo"
  // } else if (clientData.guesser == "playerTwo"){
  //   playerTurn = "playerOne"
  // }

  // var activePlayer = {
  //   type: "activePlayer",
  //   activePlayer: playerTurn
  // }

  // console.log(activeWord);
  // playerOne.send(JSON.stringify(activePlayer));
  // playerTwo.send(JSON.stringify(activePlayer));
  playerOne.send(JSON.stringify(activeWord));
  playerTwo.send(JSON.stringify(activeWord));
}

const sendToEveryone = function incoming(data) {
  console.log(wss.clients.size);
  console.log("data", data);
  var clientData = JSON.parse(data);
  console.log("json data", clientData);
  if (clientData.type == "letterGuess") {
    compareLetterToWord(clientData);
  } else if (clientData.type == "reset") {
    if (playerOne != null && playerOne.readyState == WebSocket.OPEN) {
      playerOne.send(JSON.stringify({ type: "reset" }));
      playerOne.close();
    }

    if (playerTwo != null && playerTwo.readyState == WebSocket.OPEN) {
      playerTwo.send(JSON.stringify({ type: "reset" }));
      playerTwo.close();
    }
  }
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function sendMagicWordToPlayers() {
  model.Word.find(function (err, res) {
    let randomIndex = Math.floor(Math.random()*res.length);
    // res will, of course, be the returned list of words from 
    // the db, of which I will pick one at random, and send the word
    // to both player 1 & player 2
    let magicWord = res[randomIndex].word;
    GeneratedMagicWord = magicWord;

    var wordData = {
      type: "magicWord",
      magicWord: magicWord
    };

    console.log(wordData);
    playerOne.send(JSON.stringify(wordData));
    playerTwo.send(JSON.stringify(wordData));

    // console.log(magicWord);
    // playerOne.send(magicWord);
    // playerTwo.send(magicWord);
  });
}


// When client connects to the server
wss.on('connection', function connection(ws) {
  if (playerOne == null || playerOne.readyState === WebSocket.CLOSED) {
    console.log("Setting Player 1");
    playerOne = ws;
    // During an instance where the ws for player One gets
    // information, send that information to all the other ws
    // connections the information
    playerOne.on('message', sendToEveryone);
    const playerInformation = {
      type: "player",
      player: "playerOne"
    };
    playerOne.send(JSON.stringify(playerInformation));
    
  } else if (playerTwo == null || playerTwo.readyState === WebSocket.CLOSED) {
    console.log("Setting Player 2");
    playerTwo = ws;
    // During an instance where the ws for Player Two gets
    // information, send that information to all the other ws
    // connections the information
    playerTwo.on('message', sendToEveryone);
    const playerInformation = {
      type: "player",
      player: "playerTwo"
    };
    playerTwo.send(JSON.stringify(playerInformation));
    // playerTwo.send('I am Player 2');
    // // Once player two is connected, we can now send the word
    // // that the game will be played with to each ws connection
    sendMagicWordToPlayers();
  } else {
    console.log("Already 2 players on server");
    // 1013 - Try again later
    ws.close(1013, "Already 2 players on server");
  }
});
