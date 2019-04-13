const mongoose = require('mongoose');

const ShelfBook = mongoose.Schema({
    bookId: {
        type: mongoose.Schema.ObjectId,
        ref: 'aBook',
    },
    activeIndex: Number,
    activeScroll: Number,
});


module.exports = ShelfBook;