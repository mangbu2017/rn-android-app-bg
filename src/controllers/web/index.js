const express = require('express');
const router = express.Router();
const User = require('../../model/User');
const Book = require('../../model/Book').book;
const Chapter = require('../../process/Chapter');

router.get('/user', async function(req, res) {
    try {
        const doc = await User.find({});
    
        res.send(doc);   
    }catch(err) {
        console.log('/user.error: ', err);
    }
});

router.get('/book', async function(req, res) {
    try {
        const doc = await Book.find({});
        res.send(doc);   
    }catch(err) {
        console.log('/book.error: ', err);
    }
});

router.post('/delBook', async function(req, res) {
    try {
        const { bookid } = req.body;

        console.log(bookid);

        const doc = await Book.findByIdAndRemove(bookid).catch(err => {
            console.log('delete book error:',  err);
        })

        console.log(`成功删除${doc.bookname}`);
        
        res.send({
            code: 0,
            des: '成功删除书籍',    
            data: {
                _id: bookid,
            },
        });
    }catch(err) {
        console.log('/delBook.error: ', err);
    }
});


// 单纯的从数据库中获取 章节列表
router.get('/chapters', async function(req, res) {
    const { bookid } = req.query;

    const chapter = new Chapter(bookid);

    // 不对 没有await
    const doc = chapter.init();

    const data = chapter.getChapters();

    res.send({
        code: 0,
        des: '成功获取章节信息',
        data,
    });
});

// 更新章节列表
router.get('/updateChapters', async function(req, res) {
    // get请求 正常到query中取数据
    const { bookid } = req.query;

    console.log(bookid);
    
    const chapter = new Chapter(bookid);

    await chapter.init();

    const doc = await chapter.spiderAndInsertChapter();

    // 理应返回新的章节列表
    res.send({
        code: 0,
        des: '章节更新成功',
        data: doc.chapters,
    });
});

module.exports = router;