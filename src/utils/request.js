const request = require('request');
const iconv = require('iconv-lite');

function getGBKHtml(url) {
    return new Promise((resolve, reject) => {
        request({
            url,
            header: {
                'User-Agent': 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12',
            },
        })
        .pipe(iconv.decodeStream('gbk'))
        .collect(function(err, decodedBody) {
            if(err) {
                console.log('utils.request.getGBKHtml.error: ', err);
                reject(err);
            }else {
                console.log('http获取html成功');
                resolve(decodedBody);
            }
        });    
    })
}

module.exports = {
    getGBKHtml,
};