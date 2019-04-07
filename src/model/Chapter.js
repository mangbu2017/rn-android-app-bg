const mongoose = require('mongoose');

const Chapter = mongoose.Schema({
    chaptername: String,
    content: String,
    spiderUrl: String,
});

// 如果chapter用作 子文档，在父文档中定义时[Chapter]，不可以使用model，而是要用Schema
// module.exports = mongoose.model('Chapter', Chapter);

module.exports = Chapter;