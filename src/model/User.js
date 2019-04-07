const mongoose = require('mongoose');
const ShelfBook = require('../model/ShelfBook');

const User = mongoose.Schema({
    // username
    _id: String,
    name: String,
    password: String,
    phone: String,
    createTime: {
        type: Date,
        default: Date.now,
    },
    // 我的书架
    bookshelf: [ShelfBook]
    // myBooks: [],
    // 我的缓存
    // 个人设置
});

module.exports = mongoose.model('User', User);