const express = require('express');
var cors = require('cors');
const app = express();

app.use(cors());

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.get('/datasets.json', function (req, res) {
    let datasets = [
        {
            id: 301,
            name: 'yellowdata',
            spatial: [{id:0, }]

        }
    ];
    res.send('Hello World!')
});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!')
});