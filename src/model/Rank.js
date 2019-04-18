const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const BookJoin = require('./BookJoin').BookJoin;

const Rank = mongoose.Schema({
    type: String,
    rankingList: [{ type: Schema.Types.ObjectId, ref: 'aBook' }],
});

const rank = mongoose.model('Rank', Rank);

module.exports = rank;