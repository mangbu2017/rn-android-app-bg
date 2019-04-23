const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = mongoose.Schema({
    content: String,
    createTime: {
        type: Date,
        default: Date.now(),
    },
    // 用于连接 用户信息表
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

const Comment = mongoose.model('Comment', Comments);

module.exports =  {
    Comments,
    Comment,
};