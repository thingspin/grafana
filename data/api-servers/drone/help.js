var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    let help = {
        "api": [
            {
                "api": "/projects",
                "method" : "GET",
                "response" : "project list"
            },
            {
                "api": "/projects/:id",
                "method" : "GET",
                "response" : "project (id) information"
            },
        ]
    };

    res.json(help);
});

module.exports = router;
