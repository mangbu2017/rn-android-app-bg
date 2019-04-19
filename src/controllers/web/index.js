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

router.get('/chapters', async function(req, res) {
    const { bookid } = req.query;

    const chapter = new Chapter(bookid);

    const doc = chapter.init();

    const data = chapter.getChapters();

    res.send({
        code: 0,
        des: '成功获取章节信息',
        data,
    });
});

router.get('/updateChapters', async function(req, res) {
    const { bookid } = req.query;
    
    const chapter = new Chapter(bookid);

    const doc = chapter.init();

    await chapter.spiderAndInsertChapter();

    res.send({
        code: 0,
        des: '章节更新成功',
        data: {

        }
    });
});

module.exports = router;