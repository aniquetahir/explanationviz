const express = require('express');
var cors = require('cors');
const app = express();
const {spawn} = require('child_process');

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
            title: 'NYC Yellow Cab Data/Jan 16',
            spatial: [{id:1, name: 'Pickup Location', indices: {lng:5, lat:6}},
                {id:2, name: 'Dropoff Location', indices: {lng:9, lat:10}}],
            temporal: [{id:1, name: 'Pickup Time', index: 0},
                {id:2, name: 'Dropoff Time', indices: 0}],
            nonspatial: [
                {id:0, name: 'Count'},
                {id:1, name:'Passenger Count'},
                {id:2, name: 'Trip Distance'},
                {id:3, name: 'Tip Amount'},
                {id:4, name: 'Total Amount'},
                {id:5, name: 'Tip Percentage'},
            ]
        }
    ];
    res.send(JSON.stringify(datasets));
});

app.get('/histogram.svg', function(req, res){
    let datasetid = req.query.datasetid;

    // TODO get datasetname from datasetid
    let datasetname='yellowdata';
    // EXEC Python and get svg response
    let data = '';
    const histogram_process = spawn('python3',
        ['./datapolygamyutils/datapoly1d.py',
         './datapolygamyutils/aggregates/data',
         `./datapolygamyutils/${datasetname}.header`,
         '1'
        ]);

    res.setHeader('Content-Type','image/svg+xml');

    histogram_process.stdout.on('data', (d)=>{
       data+=d;
    });

    histogram_process.stderr.on('data',(d)=>{console.log(`${d}`);});

    histogram_process.on('close', (code)=>{
        res.send(data);
        console.log(`Child process ended with code ${code}`);
    });


});

app.get('/cartogram.json', function(req, res){
    let datasetid=req.query.datasetid;
    let attributeid=req.query.attributeid;

    // TODO Get files relevant to dataset
    const aggregates_file = './datapolygamyutils/aggregates/data';
    const index_file = './datapolygamyutils/index/data';
    const temporal_resolution = '4';
    const attribute_index = attributeid;
    const neighbourhood_file = './datapolygamyutils/neighborhood.txt';

    // EXEC Python and get svg response
    let data = '';
    res.setHeader('Content-Type', 'application/json');

    const cartogram_process = spawn('python3',
        ['./datapolygamyutils/view_map_json.py',
            aggregates_file,
            index_file,
            temporal_resolution,
            attribute_index,
            neighbourhood_file
        ]);

    cartogram_process.stdout.on('data', (d)=>{
        data+=d;
    });

    cartogram_process.stderr.on('data',(d)=>{console.log(`${d}`);});

    cartogram_process.on('close', (code)=>{
        res.send(data);
        console.log(`Child process ended with code ${code}`);
    });
});

app.get('/explanations.json', function(req, res){
    let datasetid=req.query.datasetid;
    let attributeid=req.query.attributeid;

    // TODO Get files relevant to dataset
    const index_file = './datapolygamyutils/index/data';

    // EXEC Python and get json response
    let data = '';
    res.setHeader('Content-Type', 'application/json');

    const explanation_process = spawn('python3',
        ['./datapolygamyutils/calculate_salient_explanation.py',
            attributeid,
            index_file
        ]);

    explanation_process.stdout.on('data', (d)=>{
        data+=d;
    });

    explanation_process.stderr.on('data',(d)=>{console.log(`${d}`);});

    explanation_process.on('close', (code)=>{
        res.send(data);
        console.log(`Child process ended with code ${code}`);
    });

});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!')
});