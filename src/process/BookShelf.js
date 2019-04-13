const SpiderBook = require('../spider/spiderBook');
const User = require('../model/User');
const Book = require('../model/Book').book;

class BookShelf {
    constructor(username) {
        this.username = username;
    }

    async init() {
        try {
            
            this.user = await User.findById(this.username);

            return this;
        }catch(err) {
            console.log('BookShelf.childInit.error: ', err);
        }
    }

    // 不应该收录相同书籍
    async addBook(id) {

        await 

        this.user.bookshelf.push({
            bookId: id,
        });
        
        const doc  = this.user.save();
        
        return doc;
    }

    async removeBook(id) {
        this.user.bookshelf.pull(id);
        
        const doc = this.user.save();

        return doc;
    }
}

module.exports = BookShelf;