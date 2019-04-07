const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ReaderAPP', {
    autoIndex: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log('connect db.ReaderAPP on 127.0.0.1:27017');
});

module.exports = db;