const express = require('express');
var cors = require('cors');
const app = express();

app.use(cors());

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.get('/datasets.json', function (req, res) {
    // TODO get attributes from actual data
    res.setHeader('Content-Type', 'application/json');
    let datasets = [
        {
            id: 301,
            name: 'yellowdata',
            spatial: [{id:1, name: 'Pickup Location'},{id:2, name: 'Dropoff Location'}],
            nonspatial: [
                {id:0, name: 'Count'},
                {id:1, name:'Passenger Count'},
                {id:2, name: 'Tip Percentage'},
                {id:3, name: 'Trip Distance'},
                {id:4, name: 'Tip Amount'},
                {id:5, name: 'Total Amount'},
                {id:6, name: 'Tip Percentage'},
            ]
        }
    ];
    res.send(JSON.stringify(datasets));
});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!')
});