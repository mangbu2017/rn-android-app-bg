// 爬取10个分类各150条图书数据 录入Book&Cate
// 只执行一次 绝对不会产生重复数据
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const Cate = require('../model/Cate');
const Book = require('../model/Book').book;
const getHtml = require('../utils/request').getGBKHtml;
const Rank = require('../model/Rank');

const baseUrl = "https://m.x23us.com";
const SpiderBook = require('./spiderBook');

const map = {
    "玄幻魔法": "/class/1_",
    "武侠修真": "/class/2_",
    "都市言情": "/class/3_",
    "历史军事": "/class/4_",
    "侦探推理": "/class/5_",
    "网游动漫": "/class/6_",
    "科幻小说": "/class/7_",
    "恐怖灵异": "/class/8_",
    "散文诗词": "/class/9_",
    "其它类型": "/class/10_",
}

var curIndex = 0;

function requestText(url) {
    return new Promise((resolve, reject) => {
        request(url)
        .pipe(iconv.decodeStream('gbk'))
        .collect(function(err, decodedBody) {
            if(err) {
                reject(err);
            }else {
                resolve(decodedBody);
            }
        });    
    })
}

console.log('swiper-category');

const BookArray = [];
const reqArr = [];

// 初始化时使用
// 把这里同样改成只爬取 bookname & spiderUrl 的模式
Object.keys(map).forEach((key, index) => {
    const url = baseUrl + map[key];

    // 5 * 30 * 10 = 1500
    for(let i = 0; i < 1; i ++) {
        // 五个请求并发 
        reqArr.push(requestText(`${url}${i + 1}.html`));
    }
});


async function getCategory() {

    try {
        const docs = await Promise.all(reqArr);

        docs.forEach((item) => {
            const $ = cheerio.load(item);
            const list = $('.cover .line');

            for(let i = 0; i < 5; i ++) {

                const a = list.eq(i).find('a'),
                    a1 = a.eq(0),
                    bookname = a1.text(),
                    bookSpiderUrl = a1.attr('href');

                const data = {
                    bookname,
                    bookSpiderUrl,
                }

                BookArray.push(data);
            }
        });

        const models = await Book.insertMany(BookArray);

        // 此时promArr 知识创建了
        const promArr = models.map(async function(item) {
            const spider = await new SpiderBook(item._id).init();
            
            const doc = await spider.spiderBookInfo();
            
            return doc;
        });

        // ******
        const arr = models.map(item => {
            return item.id;
        });

        // 这里先不管 插进去了就行
        Object.keys(map).forEach(key => {
            new Cate({
                typeName: key,
                books: arr.splice(0, 5),
            }).save();
        });
        // ******

        const completeModels = await Promise.all(promArr);

        console.log('10个分类50条数据入库成功!');

    }catch(err) {
        console.log('async.error: ', err);
    }
    

};

// 获取某一个类别的排行
class SpiderRank{
    constructor() {
        this.baseUrl = 'https://m.x23us.com';
        this.allUrl = 'https://m.x23us.com/top/allvisit_';
        this.monthUrl = 'https://m.x23us.com/top/monthvisit_';
        this.weekUrl = 'https://m.x23us.com/top/weekvisit_';
        this.all = [];
        this.month = [];
        this.week = [];

        // const doc = await this.init();
    }

    async spider(temp) {
        // 判断排行信息是否存在 是否过期
        // 每页20条数据

        // 爬取5页
        console.log('开始爬取排行信息');
        const all = [];

        for(let i = 0; i < 1; i ++) {
            all.push(getHtml(this[temp + 'Url'] + i + '.html'));
        }

        const resArr = await Promise.all(all);

        const what = await this.processData(resArr);

        const that = this;

        console.log('what: ', what);

        const docs = await Promise.all(what.map(async function(item) {
            // {} || string
            that.all.push(item._id || item);
            const spider = await new SpiderBook(item._id).init();
            const res = await spider.spiderBookInfo();
        }));

        const doc = await new Rank({
            type: temp,
            rankingList: this.all,    
        }).save();

        console.log('cate finish');
    }

    async processData(resArr) {
        console.log('processData');
        const res = [];
        this.promArr = [];

        for(let i  = 0; i < resArr.length; i ++) {
            console.log('i: ', i);
            const html = resArr[i];

            const $ = cheerio.load(html),
                  list = $('.line');

            // async 不能写在aync中的 函数式调用 中，需for循环代替  
            for(let i = 0; i < list.length; i ++) {
                const a = list.eq(i).find('a'),
                      bookname = a.eq(1).text(),
                      bookSpiderUrl = a.eq(1).attr('href');

                await this.insertBook({
                    bookname,
                    bookSpiderUrl,
                });
            }
        };

        return Promise.all(this.promArr);
    }

    async insertBook(book) {
        const doc = await Book.findOne({bookname: book.bookname});
        // f

        console.log('doc: ', doc);
        if(!doc) {
            this.promArr.push(new Book(book).save());
        }else {
            this.promArr.push(Promise.resolve(doc._id));
        }
    }

}

// new SpiderRank().spider('month');

module.exports = SpiderRank;

