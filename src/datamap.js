import MapGL from 'react-map-gl';
import Map from './map.js';
import React, {Component} from 'react';
import HistogramView from './histogramview.js';
import {DataSelector, AttributeSelector} from './dataselector.js'
import Loading from './loading.js';
import {json as requestJson} from 'd3-request';
import _ from 'lodash';

class DataMap extends Map {
    constructor(props){
        super(props);
        this.MODE_DATASET_SELECT = 1;
        this.MODE_ATTRIBUTE_SELECT = 2;
        this.MODE_HISTOGRAM_VIEW = 3;
        this.MODE_HEATMAP_VIEW = 4;
        this.state.mode = this.MODE_DATASET_SELECT;
        this.state.loading = false;
        this.state.datasets = [];
        this.state.datasetid=null;

    }

    componentDidMount(){
        super.componentDidMount();
        this.getDataSets();
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

    showHistogram(){
        this.setState({
            mode: this.MODE_HISTOGRAM_VIEW
        })
    }

    loadHeatmap(nonspatialatt, spatialatt){
        console.log("Loading Heatmap for "+nonspatialatt+"/"+spatialatt);
        //Show Loading
        this.setState({
            loading: true
        });

        // TODO Load Heatmap data


        // TODO Process Heatmap data

        // Set Mode to Heatmap
        this.setState({
            mode: this.MODE_HEATMAP_VIEW
        });
        // Remove Loading
        this.setState({
            loading: false
        });
    }

    render(){
        const {viewport, mode, loading, datasets, datasetid} = this.state;

        let additionalViews = [];
        let additionalViewKey = 0;
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
                                   onViewHistogram={this.showHistogram.bind(this)}
                />
            );
        }else if(mode===this.MODE_HISTOGRAM_VIEW){
            additionalViews.push(
              <HistogramView key={++additionalViewKey}
                    datasetid={datasetid}
              />
            );
        }


        if(loading){
            additionalViews.push(<Loading key={++additionalViewKey} />);
        }


        return (
            <div>
                <MapGL
                    {...viewport}
                    mapStyle="mapbox://styles/anique/ciljdxi3k001daqlu1kdc45l2"
                    dragrotate={true}
                    onViewportChange={this._onChangeViewport.bind(this)}
                    mapboxApiAccessToken={this.MAPBOX_TOKEN} >
                    {/* Overlays */}
                </MapGL>
                {additionalViews}
            </div>

        );
    }
}

export default DataMap;