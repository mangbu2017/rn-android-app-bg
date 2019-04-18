const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const path = require('path');
const fs = require('fs');


const db = require('./config/dbConfig');
// const swiper = require('./src/spider/spiderBook');
// const category = require('./src/spider/spiderCategory');
// const search = require('./src/spider/spiderSearch');

const port = 9999;
const sslPort = 9102;

const app = express();

app.use(express.static(path.join(__dirname, 'static'), {
    maxAge: 7 * 24 * 60 * 60 * 1000,
}));

app.set('views', path.join(__dirname, 'views'));
// app.engine('html', );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));
app.use(cookieParser('2302258287'));
app.use(session({
    secret: '2302258287',
    resave: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    },
    saveUninitialized: true,
}));

// 路由分发
require('./src/routes/index')(app);

// 404 处理
app.use(function (req, res, next) {
    res.status(404);
    res.send('404');
});

// 500 处理
app.use(function (err, req, res, next) {
    if(err) {
        console.log(`Error:500, ${err}`);
    }
    let status = err.status || 500;
    res.status(status);
    res.send({
        status: status,
        message: err.message,
    });
});

http.createServer(app).listen(port);

console.log(`listening on http port:${port}`);
