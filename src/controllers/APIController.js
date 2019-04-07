const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Cate = require('../model/Cate');
const Book = require('../model/Book').book;
const SpiderBook = require('../spider/spiderBook');

// 登录
router.post('/login', async function(req, res) {

    const {username, password} = req.query;

    console.log(username, password);

    await User.findById(username).then(doc => {
        if(!doc) {
            res.send({
                code: 10001,
                des: '用户不存在',
            });
        }

        if(password === doc.password) {
            // req.session.user = doc;
            res.send({
                code: 0,
                data: {
                    phone: doc.phone,
                    username: doc._id,
                }
            });
        }else {
            res.send({
                code: 10002,
                des: '密码错误',
            });
        }

        // console.log(req.session.user);
    }).catch(err => {
        console.log(err);
        res.send({
            code: 20001,
            des: '参数错误',
        });
    });
});

// 注册
router.post('/register', async function(req, res) {
    const {username, password} = req.query;

    await new User({
        _id: username,
        password,
    }).save().then(doc => {
        console.log(doc);
        res.send({
            code: 0,
            des: '插入成功',
            data: Object.assign(doc, {
                // 覆盖密码字段
                password: undefined,
            }),
        });
    }).catch(err => {
        if(err.code === 11000) {
            res.send({
                code: 10003,
                des: '用户已存在',
            })
        }
        res.send({
            code: 10004,
            des: '参数错误',
        });
    });
});

// 获取 书库-分类 信息
router.get('/category', async function(req, res) {
    try {
        const doc = await Cate.find({});

        console.log(doc);
        res.send({
            code: 0,
            data: doc,
            des: '成功获取分类信息', 
        });

    }catch(err) {
        console.log(err);
    }
});

router.get('/iwant/:bn', async function(req, res) {
    try {
        const bookname = req.params.bn;

        const doc = await Book.find({bookname});

        res.send(doc);
    }catch(err) {
        console.log('/iwant/:bn.error: ', err);
    }
});

// 获取图书的章节信息
router.get('/book/:bookid/:index', async function(req, res) {
    try {
        const {bookid, index} = req.params;

        const doc = await Book.findById(bookid);
        // 无需爬取，直接读库即可
        const chapters = doc.chapters,
              chapter = chapters[index];

        if(chapter && chapter.content) {
            res.send({
                code: 0,
                data: chapter.content,
                des: '成功返回，无需爬取，信息完备',
            });
        }else {
            const spider = await new SpiderBook(bookid).init();
            // 爬取章节信息更新至数据库
            const updateChapters = await spider.spiderAndInsertChapter();
            
            const content = await spider.spiderAndInsertChapterContent(index);

            if(typeof content === 'number') {
                res.send({
                    code: '20001',
                    des: '参数错误',
                });
            }else {
                res.send({
                    code: 0,
                    data: content,
                    des: '爬取更新章节列表，章节内容至数据库',
                    updateChapters,
                });
            }
        }
    }catch(err) {
        console.log('/book/:bookid/:index.error: ', err);
    }
});

module.exports = router;