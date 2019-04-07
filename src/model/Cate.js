const mongoose = require('mongoose');

const Cate = mongoose.Schema({
    typeName: String,
    books: [String],
});

const cate = mongoose.model('Cate', Cate);

module.exports = cate;