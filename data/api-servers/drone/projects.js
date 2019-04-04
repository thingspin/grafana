var express = require('express');
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
var mysql = require('mysql');

var router = express.Router();

const baseFolder = 'C:\\Users\\lonyc\\works\\thingspin\\src\\github.com\\grafana\\grafana';

router.get('/projects', function (req, res, next) {
    const isDirectory = source => lstatSync(source).isDirectory();
    const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory);

    res.json(getDirectories(baseFolder));
});

module.exports = router;