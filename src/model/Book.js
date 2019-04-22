const mongoose = require('mongoose');
const Chapter = require('./Chapter');
// Schema
const Comment = require('./comment').comments;

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
    // 总字数
    wordCount: Number,
    // 最近更新时间
    lastUpdateTime: Date,
    // 内容标签
    tags: [String],
    // 章节数
    chaptersCount: Number,
    chapters: [Chapter],
    comments: [Comment],
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