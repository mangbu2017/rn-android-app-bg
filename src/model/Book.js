const mongoose = require('mongoose');
const Chapter = require('./Chapter');

const Book = mongoose.Schema({
    bookname: String,
    bookSpiderUrl: String,
    author: String,
    authorSpiderUrl: String,
    cover: String,
    // 简介
    intro: String,
    // 分类
    category: String,
    // 是否完本
    isFinished: Boolean,
    writeState: String,
    // 最新章节
    lastChapter:  String,
    // 最近更新时间
    lastUpdateTime: Date,
    chapters: [Chapter],
    // 我的书架
    // 我的缓存
    // 个人设置
});

const book = mongoose.model('aBook', Book);

// class BookModel extends Book {
//     super()
// } 

module.exports = {
    Book,
    book,
}