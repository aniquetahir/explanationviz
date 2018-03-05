import ReactMapGL from 'react-map-gl';
import Map from './map.js';
import React from 'react';
import Loading from './loading.js';
import {json as requestJson, csv as requestCSV, request} from 'd3-request';
import _ from 'lodash';
import DeckGLOverlay from './deckgloverlay.js';
import CartoSidepanel from './cartogram_sidepanel.js';
import {Grid, Cell, FABButton, Icon, Card, CardTitle, Snackbar} from 'react-mdl';
import wkt from 'terraformer-wkt-parser';
import {fromJS} from 'immutable';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {darcula, tomorrow} from 'react-syntax-highlighter/styles/hljs';
import sqlFormatter from "sql-formatter";
import VariableView from './mainmenu/variableview';

class DataMap extends Map {
    constructor(props){
        super(props);
        this.MODE_DATASET_SELECT = 1;
        this.MODE_ATTRIBUTE_SELECT = 2;
        //this.MODE_HISTOGRAM_VIEW = 3;
        this.MODE_HEATMAP_VIEW = 3;
        this.MODE_EXPLANATION_VIEW = 4;
        this.state.mode = this.MODE_DATASET_SELECT;
        this.state.loading = true;
        this.state.datasets = [];
        this.state.datasetid=null;
        this.state.data=null;
        this.state.hoverObject=null;
        this.state.nonspatialattribute=null;
        this.state.explanations=null;
        this.state.explanationattribute=null;
        this.state.map_image = null;
        this.state.explanationdata=[];
        this.logData = _.throttle(console.log, 1000, {trailing:false}).bind(this);
        this.setStateThrottled = _.throttle(this.setState, 300, {trailing: false}).bind(this);
        this.state.variables = [];
        this.state.scatterdata=[];

        // Variables for holding the sql for the visualizations
        this.handleShowSnackbar = this.handleShowSnackbar.bind(this);
        this.handleTimeoutSnackbar = this.handleTimeoutSnackbar.bind(this);
        this.state.vizQuery = "";
        this.state.isSnackbarActive= false;

        this.state.polyDraw = [];
    }

    componentDidMount(){
        super.componentDidMount();
        let data = this.getData();
        this.getBoundaries();
        this.setState({
            loading: false,
            data: data
        });
    }

    handleShowSnackbar() {
        this.setState({ isSnackbarActive: true });
    }
    handleTimeoutSnackbar() {
        this.setState({ isSnackbarActive: false });
        this.handleShowSnackbar();
    }




    getData(){
        let data = {
            'r_tree': {
                x: [3, 10, 29, 82],
                zones: [
                    [196,6,150,65,188,227,259,58,198,47,125,70,202,137,152,127,79,113,143,154,164,136,226,157,39,240,206,239,72,116,117,229,41,87,248,215,172,171,114,141,145,75,106,52,92,130,129,10,99,25,133,94,134,13,91,121,62,194,119,142,1,102,67,17,120,89],
                    [113,143,154,164,136,226,157,39,240,206,239,72,116,117,229,41,87,248,215,172,171,114,141,145,75,106],
                    [113,143,154,164,136,226],
                    [154,164,136,226]
                ],
                influence: [0.07611544651, 0.0418659343, 0.02604322083, 0.02759781414],
                intensity: [0.008785144342, 0.006509696373, 0.07808913822, 0.08428255137],
                selectivity: [0.8931937037, 0.8616038516, 0.2309951437, 0.226762852]
            },
            'r_star_tree': {
                x: [3, 8, 27, 78],
                zones: [
                    [87,41,248,229,117,141,172,215,171,114,106,75,39,72,239,240,206,113,143,136,154,164,226,127,70,6,65,196,137,202,227,259,150,152,198,58,79,20,88,35,156,16,205,148,24,90,186,253,15,33,201,31,61,71,74,63,256,95,103,178,122,52,251,10,94,133,199,92,91,99,25,130,129,134,204,5,78,14,82,219,128,131,208,221,139,34,223,119,194,121,62,120,1,13,67,142,17,102,89],
                    [87,41,248,229,117,141,172,215,171,114,106,75,39,72,239,240,206,113,143,136,154,164,226],
                    [39,72,239,240,206,113,143,136,154,164,226],
                    [136,154,164,226]
                ],
                influence: [0.09377295665, 0.08887043127, 0.05706487397, 0.02759781414],
                intensity: [0.0105282275, 0.01637637649, 0.05382208732, 0.08428255137],
                selectivity: [0.8968305902, 0.8353839241, 0.489415145, 0.226762852]
            }
        };

        return data;
    }

    getBoundaries(){
        requestCSV("data/boundaries.csv", (err, data)=>{
            const boundaries = data.map(obj=>{
                return {
                    id: parseInt(obj.objectid),
                    polygon: wkt.parse(obj.shape).coordinates
                };
            });

            console.log(boundaries);
            this.setState({
                boundaries: boundaries
            })
        });
    }

    changeHoverObject(object){
        // this.setState({
        //     hoverObject: object
        // });
    }


    displayZones(zones){
        let filteredBoundaries = this.state.boundaries.filter(b=>zones.indexOf(b.id)!==-1);
        this.logData(filteredBoundaries);
        //
        this.setStateThrottled({
            explanationdata: filteredBoundaries
        });
    }

    revertState(){

    }

    createWKT(poly){
      let wkt = "POLYGON ((";
      poly.forEach(coord=>{wkt+=`${coord[0]} ${coord[1]}, `});
      wkt+=`${poly[0][0]} ${poly[0][1]}))`;
      return wkt;
    }


    getScatterPlot(sql){
        console.log(sql);
        const {polyDraw} = this.state;
        let query_sql = sql;
        if(polyDraw.length>=3){
            query_sql = sql + ` and ST_CONTAINS(ST_GeomFromWKT('${this.createWKT(polyDraw)}'), ST_Point(
                CAST(pickup_longitude AS DECIMAL(24,14)),CAST(pickup_latitude AS DECIMAL(24,14)) 
            ))`;
        }

        request('http://'+window.location.hostname+':8080/scatter.json')
            .header("Content-Type", "application/json")
            .post(
                JSON.stringify({sql: query_sql}),
                (err, data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log(data);
                        let where = sql.toLowerCase().split("where")[1];

                        if(polyDraw.length >=3){
                            where += " AND ST_CONTAINS('"+this.createWKT(polyDraw)+"', taxi.pickup)"
                        }
                        this.setState({
                            map_image: "data:image/png;base64," + JSON.parse(data.responseText).image,
                            vizQuery: `SELECT ScatterPlot(taxi.pickup) FROM NYCtaxi taxi WHERE ${where}`
                        });
                        this.handleShowSnackbar();
                    }
                }
            );
    }

    getHeatmapPlot(sql){
        console.log(sql);
        const {polyDraw} = this.state;
        let query_sql = sql;
        if(polyDraw.length>=3){
            query_sql = sql + ` and ST_CONTAINS(ST_GeomFromWKT('${this.createWKT(polyDraw)}'), ST_Point(
                CAST(pickup_longitude AS DECIMAL(24,14)),CAST(pickup_latitude AS DECIMAL(24,14)) 
            ))`;
        }

        request('http://'+window.location.hostname+':8080/hmap.json')
            .header("Content-Type", "application/json")
            .post(
              JSON.stringify({sql: query_sql}),
                (err, data)=> {
                  if(err){
                      console.log(err);
                  }else{
                      console.log(data);
                      let where = sql.toLowerCase().split("where")[1];

                      if(polyDraw.length >=3){
                          where += " AND ST_CONTAINS('"+this.createWKT(polyDraw)+"', taxi.pickup)"
                      }
                      this.setState({
                          map_image: "data:image/png;base64," + JSON.parse(data.responseText).image,
                          vizQuery: `SELECT HeatMap(taxi.pickup) FROM NYCtaxi taxi WHERE ${where}`
                      });
                      this.handleShowSnackbar();
                  }
                }
            );
    }

    getCartogramPlot(sql){
        console.log(sql);
        const {polyDraw} = this.state;

        let query_sql = sql;
        if(polyDraw.length>=3){
            query_sql = sql + ` and ST_CONTAINS(ST_GeomFromWKT('${this.createWKT(polyDraw)}'), ST_Point(
                CAST(pickup_longitude AS DECIMAL(24,14)),CAST(pickup_latitude AS DECIMAL(24,14)) 
            ))`;
        }

        request('http://'+window.location.hostname+':8080/carto.json')
            .header("Content-Type", "application/json")
            .post(
                JSON.stringify({sql: query_sql}),
                (err, data)=> {
                    if(err){
                        console.log(err);
                    }else{
                        console.log(data);
                        let where = sql.toLowerCase().split("where")[1];

                        if(polyDraw.length >=3){
                            where += " AND ST_CONTAINS('"+this.createWKT(polyDraw)+"', taxi.pickup)"
                        }
                        this.setState({
                            map_image: "data:image/png;base64," + JSON.parse(data.responseText).image,
                            vizQuery: `SELECT ChoroplethMap(taxi.pickup) FROM NYCtaxi taxi, AreaLandmarks arealm WHERE ${where}`
                        });
                        this.handleShowSnackbar();
                    }
                }
            );
    }

    printClickCoordinates(event){
        //console.log(event);
        let coords = this.state.polyDraw;
        coords.push(event.lngLat);

        this.setState({
            polyDraw:coords
        });

        console.log(coords);
    }

    clearPolyDraw(){
        this.setState({
            polyDraw: []
        });
    }

    addVariable(sql){
        let variables = this.state.variables.slice();
        variables.push(sql);

        this.setStateThrottled({
            variables: variables
        });

        console.log(sql);


    }

    getContext(){
        return this;
    }


    render(){
        const {viewport, mode, loading, data, datasets, datasetid, isSnackbarActive} = this.state;

        let additionalViews = [];
        let outerViews = [];
        let additionalViewKey = 0;
        let outerViewKey = 0;




        if(loading){
            outerViews.push(<Loading key={++outerViewKey} />);
        }

        const drawerStyle = {
            position: 'absolute',
            width: "500px",
            bottom: '10px',
            left: '10px',
            top: '10px',
            overflowY: 'scroll'
        };


        // const mapStyle = fromJS({
        //     "version": 8,
        //     "name": "Light",
        //     "sources": {
        //         "mapbox": {
        //             "type": "vector",
        //             "url": "mapbox://mapbox.mapbox-streets-v6"
        //         },
        //         "overlay": {
        //             "type": "image",
        //             "url": this.state.map_image==null?"":this.state.map_image,
        //             "coordinates": [
        //                         [-74.25, 40.9],
        //                         [-73.7, 40.9],
        //                         [-73.7, 40.5],
        //                         [-74.25, 40.5]
        //             ]
        //         }
        //         // "overlay": {
        //         //     "type": "image",
        //         //     "url": this.state.map_image,
        //         //     "coordinates": [
        //         //         [-74.25, 40.9],
        //         //         [-73.7, 40.9],
        //         //         [-73.7, 40.5],
        //         //         [-74.25, 40.5]
        //         //     ]
        //         // }
        //     },
        //     "sprite": "mapbox://sprites/mapbox/dark-v9",
        //     "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        //     "layers": [
        //         {
        //             "id": "background",
        //             "type": "background",
        //             "paint": {"background-color": "#111"}
        //         },
        //         {
        //             "id": "water",
        //             "source": "mapbox",
        //             "source-layer": "water",
        //             "type": "fill",
        //             "paint": {"fill-color": "#2c2c2c"}
        //         },
        //         {
        //             "id": "boundaries",
        //             "source": "mapbox",
        //             "source-layer": "admin",
        //             "type": "line",
        //             "paint": {"line-color": "#797979", "line-dasharray": [2, 2, 6, 2]},
        //             "filter": ["all", ["==", "maritime", 0]]
        //         },
        //         {
        //             "id": "overlay",
        //             "source": "overlay",
        //             "type": "raster",
        //             "paint": {"raster-opacity": 0.85}
        //         },
        //         {
        //             "id": "cities",
        //             "source": "mapbox",
        //             "source-layer": "place_label",
        //             "type": "symbol",
        //             "layout": {
        //                 "text-field": "{name_en}",
        //                 "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
        //                 "text-size": [
        //                     "interpolate",
        //                     ["linear"],
        //                     ["zoom"],
        //                     4, 9,
        //                     6, 12
        //                 ]
        //             },
        //             "paint": {
        //                 "text-color": "#969696",
        //                 "text-halo-width": 2,
        //                 "text-halo-color": "rgba(0, 0, 0, 0.85)"
        //             }
        //         },
        //         {
        //             "id": "states",
        //             "source": "mapbox",
        //             "source-layer": "state_label",
        //             "type": "symbol",
        //             "layout": {
        //                 "text-transform": "uppercase",
        //                 "text-field": "{name_en}",
        //                 "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
        //                 "text-letter-spacing": 0.15,
        //                 "text-max-width": 7,
        //                 "text-size": [
        //                     "interpolate",
        //                     ["linear"],
        //                     ["zoom"],
        //                     4, 10,
        //                     6, 14
        //                 ]
        //             },
        //             "filter": [">=", "area", 80000],
        //             "paint": {
        //                 "text-color": "#969696",
        //                 "text-halo-width": 2,
        //                 "text-halo-color": "rgba(0, 0, 0, 0.85)"
        //             }
        //         }
        //     ]
        // });

        return (
            <div className="page-content">
                <Grid noSpacing={true} style={{height: '100%'}} >
                    <Cell col={4} style={{height: '100%',overflowY: 'scroll'}}>
                        <CartoSidepanel
                                        data={this.props.statsData}
                                        showLegend={false}
                                        getScatterPlot={this.getScatterPlot.bind(this)}
                                        getHeatmapPlot={this.getHeatmapPlot.bind(this)}
                                        getCartogramPlot={this.getCartogramPlot.bind(this)}
                                        pltFunc={this.displayZones.bind(this)}
                                        getContext={this.getContext.bind(this)}
                        />
                    </Cell>
                    <Cell col={8} align='stretch' >
                        <ReactMapGL
                            {...viewport}
                            ref={obj=>this.mapComponent=obj}
                            onClick={this.printClickCoordinates.bind(this)}
                            mapStyle="mapbox://styles/anique/cj887jlt131vu2srt4ve78bdj"
                            dragrotate={true}
                            onViewportChange={this._onChangeViewport.bind(this)}
                            mapboxApiAccessToken={this.MAPBOX_TOKEN} >
                            <DeckGLOverlay ref={deck=>this.deckGL=deck} className='deckoverlay' viewport={viewport}
                                           strokeWidth={3}
                                           data={this.state.explanationdata}
                                           scatterdata={this.state.scatterdata}
                                           polyDraw={this.state.polyDraw}
                                           onHoverPolygon={this.changeHoverObject.bind(this)}
                            />
                        </ReactMapGL>
                    </Cell>
                </Grid>



                {/*<Card shadow={0} style={drawerStyle}>*/}
                    {/*<CardTitle expand>*/}
                        {/*{additionalViews}*/}
                    {/*</CardTitle>*/}
                {/*</Card>*/}
                {/*<Snackbar*/}
                    {/*active={isSnackbarActive}*/}
                    {/*onTimeout={this.handleTimeoutSnackbar}*/}
                    {/*timeout={900000}*/}
                {/*>*/}
                    {/*<SyntaxHighlighter language='sql' style={darcula} customStyle={{textAlign: 'left', width:  '500px', overflowX: 'scroll'}} >*/}
                        {/*{sqlFormatter.format(this.state.vizQuery)}*/}
                    {/*</SyntaxHighlighter>*/}
                {/*</Snackbar>*/}
                {/*/!*{outerViews}*!/*/}
                <VariableView variables={this.state.variables} getContext={this.getContext.bind(this)} />
                {/*<div style={{position: 'absolute', top: '10px', right: '10px'}}>*/}
                    {/*<FABButton mini><Icon name="mode_edit" /></FABButton>*/}
                    {/*<FABButton onClick={this.clearPolyDraw.bind(this)} mini><Icon name="format_paint" /></FABButton>*/}

                {/*</div>*/}
            </div>

        );
    }
}

export default DataMap;