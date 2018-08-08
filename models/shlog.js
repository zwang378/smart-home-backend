const mongoose = require('mongoose');


let Schema = mongoose.Schema;

const signatureSchema = new Schema({
  message: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  time: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
})

const Shlog = mongoose.model('Shlog', signatureSchema);

module.exports = Shlog;
