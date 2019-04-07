// 爬取10个分类各150条图书数据 录入Book&Cate
// 只执行一次 绝对不会产生重复数据
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const Cate = require('../model/Cate');
const Book = require('../model/Book').book;

const baseUrl = "https://m.x23us.com";

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

Object.keys(map).forEach((key, index) => {
    const url = baseUrl + map[key];

    // 5 * 30 * 10 = 1500
    for(let i = 0; i < 1; i ++) {
        // 五个请求并发 
        reqArr.push(requestText(`${url}${i + 1}.html`));
    }
});

Promise.all(reqArr).then(res => {
    res.forEach((item) => {
        const $ = cheerio.load(item);
        const list = $('.cover .line');

        for(let i = 0; i < 5; i ++) {

            const a = list.eq(i).find('a'),
                category = $('.state').text(),
                a1 = a.eq(0),
                a2 = a.eq(1),
                bookname = a1.text(),
                author = a2.text(),
                bookSpiderUrl = a1.attr('href'),
                authorSpiderUrl = a2.attr('href');

            const data = {
                bookname,
                author,
                category,
                bookSpiderUrl,
                authorSpiderUrl,
            }

            BookArray.push(data);
        }
    });
    console.log('BookArray: ', BookArray);

    Book.insertMany(BookArray, function(err, doc) {
        if(err) {
            console.log('Book.insertMany.error: ', err);
            return;
        }
        console.log('10个分类50条数据入库成功!');

        const arr = doc.map(item => {
            return item.id;
        });

        Object.keys(map).forEach(key => {
            new Cate({
                typeName: key,
                books: arr.splice(0, 5),
            }).save();
        });

    }); 
});

