const SpiderCategory = require('../spider/spiderCategory');
const RankModel = require('../model/Rank');

class Rank extends SpiderCategory {
    constructor(type) {
        super(type);
    }

    async getRankingList(type) {
        try {
            return RankModel.findOne({
                type,
            }).populate('rankingList');   
        }catch(err) {
            console.log('Rank.getRankingList.error: ', err);
        }
    }
}

// (new Rank()).spider('all');

// module.exports = Rank;

module.exports = Rank;