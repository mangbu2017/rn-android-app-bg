const SpiderBook = require('../spider/spiderBook');

class Chapter extends SpiderBook {
    constructor(id) {
        super(id);
    }
    getChapters() {
        return this.book.chapters;
    }
}

module.exports = Chapter;