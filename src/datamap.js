import MapGL from 'react-map-gl';
import Map from './map.js';
import React from 'react';
import HistogramView from './histogramview.js';
import {DataSelector, AttributeSelector} from './dataselector.js'
import Loading from './loading.js';
import {json as requestJson, csv as requestCSV} from 'd3-request';
import _ from 'lodash';
import DeckGLOverlay from './deckgloverlay.js';
import CartoSidepanel from './cartogram_sidepanel.js';
import ExplanationView from "./explanationview";
import {Grid, Cell, FABButton, Icon} from 'react-mdl';
import wkt from 'terraformer-wkt-parser';


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
        this.state.explanationdata=[];
        this.logData = _.throttle(console.log, 1000, {trailing:false}).bind(this);
        this.setStateThrottled = _.throttle(this.setState, 300, {trailing: false}).bind(this);
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
        this.setState({
            hoverObject: object
        });
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

    render(){
        const {viewport, mode, loading, data, datasets, datasetid} = this.state;

        let additionalViews = [];
        let outerViews = [];
        let additionalViewKey = 0;
        let outerViewKey=0;


        additionalViews.push(
            <CartoSidepanel key={++additionalViewKey}
                            data={data}
                            showLegend={false}
                            pltFunc={this.displayZones.bind(this)}
            />
        );


        if(loading){
            outerViews.push(<Loading key={++outerViewKey} />);
        }

        const drawerStyle = {
            width: "25%"
        };

        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
                <div className="mdl-layout__drawer" style={drawerStyle}>
                    <Grid>
                        <Cell col={12}>
                            <span className="mdl-layout-title" style={{padding: 0}}>Evaluation</span>
                        </Cell>
                    </Grid>


                    <nav className="mdl-navigation">
                        {/* Options */}
                        {additionalViews}
                    </nav>
                </div>
                <main className="mdl-layout__content">

                    <div className="page-content">
                        <MapGL
                            {...viewport}
                            mapStyle="mapbox://styles/anique/cj887jlt131vu2srt4ve78bdj"
                            dragrotate={true}
                            onViewportChange={this._onChangeViewport.bind(this)}
                            mapboxApiAccessToken={this.MAPBOX_TOKEN} >
                            <DeckGLOverlay className='deckoverlay' viewport={viewport}
                                           strokeWidth={3}
                                           data={this.state.explanationdata}
                                           onHoverPolygon={this.changeHoverObject.bind(this)}
                            />
                        </MapGL>
                        {/*{outerViews}*/}
                    </div>
                </main>
            </div>

        );
    }
}

export default DataMap;