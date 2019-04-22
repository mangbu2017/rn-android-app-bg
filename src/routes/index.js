module.exports = function(app) {
    const rules = {
        '/': require('../controllers/HomeController'),
        '/api': require('../controllers/APIController'),
        '/web': require('../controllers/web/index'),
    }

    Object.keys(rules).forEach(key => {
        app.use(key, rules[key]);
    });
}