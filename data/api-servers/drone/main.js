const express = require('express');
const app = express();
var argv = require('minimist')(process.argv.slice(2), {  
    default: {
        port: 1881
    },
});

app.use(require('./help'));
app.use(require('./projects'));

app.listen(argv.port, () => {});