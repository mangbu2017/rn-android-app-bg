const urlencode = require('urlencode');
const cheerio = require('cheerio');

const getHtml = require('../utils/request').getGBKHtml;

const Book = require('../model/Book').book;
const Chapter = require('../model/Chapter');        

/**
 * 根据关键字爬取顶点小说前30条数据并插入Book表(保证无重复书籍)
 * 此举保证了我们肯定能查询到数据 
 * 还需确保 兼容精确搜索
 */
class SpiderSearch {
    constructor(keyowrd) {
        this.keyword = keyowrd;
        this.data = [];
        this.init();
    }

    async init() {
        try {
            this._initUrl();

            await this.spiderSearchList();

            console.log(this.data);
            this.processSearchList();

            const proArr = this.data.map(item => {
                return this.insertOneBook(item);
            });

            const resArr = await Promise.all(proArr);

            console.log(resArr);
        }catch(err) {
            console.log('SpiderSearch.init.error: ', err);
        }
    }

    spiderSearchList() {
        return getHtml(this.searchUrl).then(res => {
            this.searcHtml = res;
            console.log(`爬取${this.searchUrl}成功!`);
        }).catch(err => { 
            console.log('SpiderSearch.spider.error: ', err);
        });
    }

    processSearchList() {
        const $ = cheerio.load(this.searcHtml),
              list = $('.cover > p');

        console.log('干你嘛呢');
        console.log(this.data);
        if(list && list.length === 0) {
            console.log('精确搜索', list);
            const a = $('.block_txt2 a'),
                  bookname = a.eq(1).text(),
                  author = a.eq(2).text(),
                  bookSpiderUrl = $('.more > a').attr('href').substr(19);
                  
            this.data.push({
                bookname,
                author,
                bookSpiderUrl,
                chapters: [],
            });

        }else {
            console.log('模糊搜索', list);
            for(let i = 0; i < list.length; i ++) {

                const a = list.eq(i).find('a'),
                      a1 = a.eq(0),
                      a2 = a.eq(1),
                      bookname = a1.text(),
                      author = a2.text(),
                      bookSpiderUrl = a1.attr('href'),
                      authorSpiderUrl = a2.attr('href');
    
                const data = {
                    bookname,
                    author,
                    bookSpiderUrl,
                    authorSpiderUrl,
                    chapters: [],
                }
    
                this.data.push(data);
            }
        }
        console.log('this.data: ', this.data);
    }

    async spiderAndProcessChapter(book) {
        console.log('spiderAndProcessChpater');
        try {
            const html = await getHtml(this.baseUrl + book.bookSpiderUrl);
                const $ = cheerio.load(html),
                      list = $('.chapter a'),
                      type = $('.index_block p a').eq(0).text();
                      console.log('list&type: ', list, type);

                book.category = type;

                for(let i = list.length - 1; i >= 0; i --) {

                    const chaptername = list.eq(i).text(),
                          spiderUrl = list.eq(i).attr('href');

                    book.chapters.push({
                        chaptername,
                        spiderUrl, 
                    });
                }
            
        }catch(err) {
            console.log('SpiderSearch.spiderAndProcessChapter.error: ', err);
        }
    }
    

    /**
     * 插入一本书(保证bookname不重复)
     * @param {Book} book 
     */
    async insertOneBook(book) {
        try {
            const doc = await Book.find({ bookname: book.bookname });

            if(doc.length === 0) {

                await this.spiderAndProcessChapter(book);

                const doc_1 = await new Book(book).save();

                // async 最后返回的promise是需要return 传入 决议值的
                return doc_1;
            }
        }catch(err) {
            console.log('SpiderSearch.insertOneBook.error: ', err);
        }
    }

    _initUrl() {
        const gb2312 = urlencode.encode(this.keyword, 'gb2312');
        this.searchUrl = 'https://m.x23us.com/modules/article/search.php?searchtype=keywords&searchkey=' + gb2312;
        this.baseUrl = 'https://m.x23us.com';
    }
}

new SpiderSearch('大明文魁');


module.exports = SpiderSearch;