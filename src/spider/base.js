const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const getHtml = require('../utils/request').getGBKHtml;
const baseUrl = "https://m.x23us.com/html/8/8088/";

const Book = require('../model/Book').book;

class SpiderBase {
    constructor(id) {
        this._init(id);
    }

    async init(id) {
        this.id = id;
        this.baseUrl = "https://m.x23us.com";
        this._getHtml = getHtml;
        this.book = await Book.findById(this.id);
    }


    async init() {
        if(this.book.chapters.length === 0) {
            const doc = await this.spiderAndProcessChapter(this.book);
            await this.book.chapters.push(doc);
            console.log(this.book.chapters)
        }
    }

    async spiderAndProcessChapter(book) {
        console.log('spiderAndProcessChpater');
        try {
            const html = await getHtml(this.baseUrl + book.bookSpiderUrl);
                // console.log(html);
                const $ = cheerio.load(html),
                      list = $('.chapter a'),
                      type = $('.index_block p a').eq(0).text();
                      console.log('list&type: ', list, type);

                book.category || (book.category = type);

                console.log('book: ', book);

                for(let i = list.length - 1; i >= 0; i --) {

                    const chaptername = list.eq(i).text(),
                          spiderUrl = list.eq(i).attr('href');

                    book.chapters.push({
                        chaptername,
                        spiderUrl, 
                    });
                }

                await book.save();
                console.log('完成');
            
        }catch(err) {
            console.log('SpiderSearch.spiderAndProcessChapter.error: ', err);
        }
    }
}

new SpiderBook('5ca4993bd735561b75616397');