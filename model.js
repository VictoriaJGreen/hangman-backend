const mongoose = require('mongoose');

// MONGOOSE connection
mongoose.connect('mongodb://victoria:victoria1@ds133418.mlab.com:33418/websockets', {useNewUrlParser: true});
//mlab accnt victoriajgreen victoria1

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  }
});

const Word = mongoose.model('words', wordSchema);

module.exports = {
  Word: Word
}