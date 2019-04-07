const request = require('request');
const iconv = require('iconv-lite');

function getGBKHtml(url) {
    return new Promise((resolve, reject) => {
        request(url)
        .pipe(iconv.decodeStream('gbk'))
        .collect(function(err, decodedBody) {
            if(err) {
                console.log('utils.request.getGBKHtml.error: ', err);
                reject(err);
            }else {
                console.log('okokok');
                resolve(decodedBody);
            }
        });    
    })
}

module.exports = {
    getGBKHtml,
};