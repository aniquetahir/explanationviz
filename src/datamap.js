import MapGL from 'react-map-gl';
import Map from './map.js';
import React from 'react';
import HistogramView from './histogramview.js';
import {DataSelector, AttributeSelector} from './dataselector.js'
import Loading from './loading.js';
import {json as requestJson} from 'd3-request';
import _ from 'lodash';
import DeckGLOverlay from './deckgloverlay.js';

class DataMap extends Map {
    constructor(props){
        super(props);
        this.MODE_DATASET_SELECT = 1;
        this.MODE_ATTRIBUTE_SELECT = 2;
        this.MODE_HISTOGRAM_VIEW = 3;
        this.MODE_HEATMAP_VIEW = 4;
        this.state.mode = this.MODE_DATASET_SELECT;
        this.state.loading = true;
        this.state.datasets = [];
        this.state.datasetid=null;
        this.state.data=null;

    }

    componentDidMount(){
        super.componentDidMount();
        this.getDataSets();
        this.setState({
            loading: false
        });
    }

    getDataSets(){
        // Show Loading
        this.setState({
            loading: true
        });

        requestJson('http://localhost:8080/datasets.json', (err, resp)=>{
            if(err){
                console.log(err);
            }else{
                this.setState({
                    datasets: resp
                });
            }
            this.setState({
                loading: false
            });
        });
    }

    loadDataSet(datasetid){
        console.log("Loading dataset "+datasetid);

        // Show Loading
        this.setState({
            loading: true,
            datasetid: datasetid
        });

        let nonspatialattributes = [];
        let spatialattributes =[];

        let result = _.find(this.state.datasets, (dataset)=>{return dataset.id===datasetid;});
        if(result){
            nonspatialattributes = result.nonspatial;
            spatialattributes = result.spatial;
        }else{
            console.log('No matching dataset found');
        }

        // Change Mode
        this.setState({
            mode: this.MODE_ATTRIBUTE_SELECT,
            nonSpatialAttrs: nonspatialattributes,
            spatialAttrs: spatialattributes,
            datasetid: datasetid
        });


        this.setState({
            loading: false
        });
    }


    loadHeatmap(nonspatialatt, spatialatt){
        console.log("Loading Heatmap for "+nonspatialatt+"/"+spatialatt);
        //Show Loading
        this.setState({
            loading: true,
            mode: this.MODE_HEATMAP_VIEW
        });


        // TODO Load Heatmap data
        requestJson(`http://localhost:8080/cartogram.json?attributeid=${nonspatialatt}`,
            (err, resp)=>{
                if(err){
                    console.log(err);
                }else{
                    this.setState({
                        data: resp
                    });
                }
                this.setState({
                    loading: false
                });

            }

        );

    }

    render(){
        const {viewport, mode, loading, datasets, datasetid, data} = this.state;

        let additionalViews = [];
        let outerViews = [];
        let additionalViewKey = 0;
        let outerViewKey=0;


        if(mode===this.MODE_DATASET_SELECT){
            additionalViews.push(
                <DataSelector key={++additionalViewKey}
                              datasets={datasets}
                              onDataSelect={this.loadDataSet.bind(this)}

                />
            );
        }

        if(mode===this.MODE_ATTRIBUTE_SELECT){
            additionalViews.push(
                <AttributeSelector key={++additionalViewKey}
                                   nonspatialattributes={this.state.nonSpatialAttrs}
                                   spatialattributes={this.state.spatialAttrs}
                                   onAttributeSet={this.loadHeatmap.bind(this)}
                />
            );
            outerViews.push(
                <HistogramView key={++outerViewKey}
                               datasetid={datasetid}
                />
            );
        }


        if(loading){
            outerViews.push(<Loading key={++outerViewKey} />);
        }


        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
                <div className="mdl-layout__drawer">
                    <span className="mdl-layout-title" style={{padding: 0}}>GeoSpatial Viz</span>
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
                                           data={data}
                            />
                        </MapGL>
                        {outerViews}
                    </div>
                </main>
            </div>

        );
    }
}

export default DataMap;