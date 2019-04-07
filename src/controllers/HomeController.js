const express = require('express');
const router = express.Router();

router.get('/home', async function(req, res) {
    console.log('visit /home');
    
    res.send('APP BACKGROUND');
});

module.exports = router;