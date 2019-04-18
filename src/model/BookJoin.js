const mongoose = require('mongoose');

const BookJoin = mongoose.Schema({
    bookId: { 
        type: 'ObjectId', 
        ref: 'aBook',
    },
});

const bookJoin = mongoose.model('BookJoin', BookJoin);

module.exports = {
    BookJoin,
    bookJoin,
};