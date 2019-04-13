const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const getHtml = require('../utils/request').getGBKHtml;
const baseUrl = "https://m.x23us.com/html/8/8088/";

const Book = require('../model/Book').book;

class SpiderBook {
    constructor(id) {
        this.baseUrl = "https://m.x23us.com";
        this.id = id;
    }

    async init() {
        try {
            this.book = await Book.findById(this.id);

            if(this.book.intro) {
                console.log('详细信息已录入，无需再次爬取');
                return this;
            }

            await this.spiderBookInfo();

            return this;
        }catch(err) {
            console.log('SpiderBook.init.error: ', err);
        }
    }
    /**
     * 爬取书籍详细信息
     */
    async spiderBookInfo() {
        try {

            const bookSpiderUrl = this.book.bookSpiderUrl;
            const arr = bookSpiderUrl.split('/');
            const url = 'https://m.x23us.com/book/' + arr[3];

            const html = await getHtml(url);

            const $ = cheerio.load(html),
                  cover =  $('.block_img2 img').attr('src'),
                  p = $('.block_txt2 p'),
                  writeState = p.eq(4).text().substr(3),
                  lastUpdateTime = p.eq(5).text().substr(3),
                  lastChapter = p.eq(6).find('a').text(),
                  intro = $('.intro_info').text();

            this.book.cover = cover;
            this.book.writeState = writeState;
            this.book.lastUpdateTime = lastUpdateTime;
            this.book.lastChapter = lastChapter;
            this.book.intro = intro;

            await this.book.save();

            console.log(this.book.bookname, '书籍信息录入成功');
                  
        }catch(err) {
            console.log('SpiderBook.spiderBookInfo.error: ', err);
        }
    }
    /**
     * 爬取章节列表至最新章节
     */
    async spiderAndInsertChapter() {
        try {
            console.log(`开始爬取《${this.book.bookname}》章节列表`);
            const html = await getHtml(this.baseUrl + this.book.bookSpiderUrl);
            const $ = cheerio.load(html),
                    // 获取到的是所有的
                    list = $('.chapter a'),
                    type = $('.index_block p a').eq(0).text(),
                    len = this.book.chapters.length,
                    lastLength = this.lastLength = list.length;

            this.book.category || (this.book.category = type);

            // 获取开始缺少处的章节 到 最新章节
            const res = [];
            for(let i = lastLength - len - 1; i >= 0; i --) {    

                const chaptername = list.eq(i).text(),
                        spiderUrl = list.eq(i).attr('href');

                console.log(i, chaptername);

                const data = {
                    chaptername,
                    spiderUrl, 
                };

                this.book.chapters.push(data);
                res.push(data);
            }

            await this.book.save();
            console.log(`完成，爬取之前${len}章，爬取之后${lastLength}章`);

            // 这里可能出现错误
            return res;
        }catch(err) {
            console.log('SpiderSearch.spiderAndProcessChapter.error: ', err);
        }
    }
    /**
     * 获取章节内容
     * @param {Number} index 
     */
    async spiderAndInsertChapterContent(index) {

        try {

            if(this.lastLength && index > this.lastLength) {
                return 0;
            }

            const chapter = this.book.chapters[index];

            if(chapter.content) {
                console.log('章节内容不进行重复爬取');
                // console.log('chapter.content', typeof chapter.content);
                return;
            }
            // content字段未设置取值为undefined
            // console.log('chapter.content: ', typeof chapter.content);
            const url = this.baseUrl + this.book.bookSpiderUrl + chapter.spiderUrl;

            const html = await getHtml(url);

            const $ = cheerio.load(html),
                content = $('#txt').text();
            
            chapter.content = content;

            await this.book.save();

            console.log(`获取第${index}章内容成功`);

            return content;
        }catch(err) {
            console.log('SipderBook.spiderAndInsertChapterContent.error: ', err);
        }
    }
}

// 这种写法还是有些蛋疼
// (async function() {
//     const spider = await new SpiderBook('5ca4993bd735561b75616375').init();
//     const res = await spider.spiderBookInfo();
// }());

module.exports = SpiderBook;
