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
    }

    async init() {
        try {
            // 初始化url&关键字
            this._initUrl();

            // 获取匹配的书籍列表html
            await this.spiderSearchList();

            // 处理列表 得到data
            this.processSearchList();

            // 获取章节列表并插库
            const proArr = this.data.map(item => {
                return this.insertOneBook(item);
            });

            const resArr = await Promise.all(proArr);

            if(resArr.length == 0 && !resArr[0]) {
                console.log('爬取排行item，已经有数据了');
            }else {
                console.log('爬取排行item，已经进行爬取');
            }

            return resArr[0];
            // return this;
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

        if(list && list.length === 0) {
            console.log('精确匹配单个doc');
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
            console.log('模糊匹配多个doc', list);
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
    }

    async spiderAndProcessChapter(book) {
       
        try {
            const html = await getHtml(this.baseUrl + book.bookSpiderUrl);
                const $ = cheerio.load(html),
                      list = $('.chapter a'),
                      type = $('.index_block p a').eq(0).text();

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
            console.log('数据重复，不尽兴重复插入');
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

// new SpiderSearch('大明文魁').init();


module.exports = SpiderSearch;