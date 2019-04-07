const mongoose = require('mongoose');

const ShelfBook = mongoose.Schema({
    bookId: String,
    activeIndex: Number,
    activeScroll: Number,
});


module.exports = ShelfBook;