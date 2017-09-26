import MapGL from 'react-map-gl';
import Map from './map.js';
import React, {Component} from 'react';
import Loading from './loading.js';
import {json as requestJson} from 'd3-request';
import _ from 'lodash';

class DataSelector extends Component{
    render(){
        const {datasets} = this.props;
        let componentStyle = {
            position: 'absolute',
            left: '1%',
            top: '1%'
        };
        return (
            <div className='data-selector' style={componentStyle}>
                <table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                    <thead>
                    <tr>
                        <th className="mdl-data-table__cell--non-numeric">Dataset Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Iteratively list all the datasets */}
                    {datasets.map((d)=>{
                        return (
                            <tr key={d.id}>
                                <td className="mdl-data-table__cell--non-numeric"
                                    onClick={()=>{this.props.onDataSelect(d.id);}}>{d.name}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );

    }
}

class AttributeSelector extends Component{
    constructor(props){
        super(props);
        this.state = {
            nonspatial: 0,
            spatial: 0
        }
    }
    render(){
        const {nonspatialattributes, spatialattributes} = this.props;

        let componentStyle = {
            position: 'absolute',
            left: '1%',
            top: '1%',
            width: '50%'
        };

        let selectedStyle = {
          background: "#4bd3ff"
        };

        return (
            <div className="attribute-selector" style={componentStyle}>
                <div style={{width: "100%", background:'rgba(0,0,0,0.5)'}} className="mdl-card mdl-shadow--2dp">
                    <div className="mdl-card__title mdl-card--expand">
                            <div className="mdl-grid">
                                <div style={{color: 'lightgray'}} className="mdl-cell mdl-cell--12-col">
                                    <h2>Select Observation Attributes</h2>
                                </div>
                            </div>
                            <div className="mdl-grid">
                                <div className="mdl-cell mdl-cell--6-col">
                                    <table style={{width: '100%'}} className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                                        <thead>
                                        <tr>
                                            <th className="mdl-data-table__cell--non-numeric">Non Spatial Attributes</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/* Iteratively list all the attributes */}
                                        {nonspatialattributes.map((d)=>{
                                            return (
                                                <tr key={d.id} style={
                                                    (()=>{
                                                        if(d.id===this.state.nonspatial){return selectedStyle;}
                                                    })()
                                                }
                                                    onClick={()=>this.setState({nonspatial: d.id})}>
                                                    <td className="mdl-data-table__cell--non-numeric">{d.name}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mdl-cell mdl-cell--6-col">
                                    <table style={{width: '100%'}} className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                                        <thead>
                                        <tr>
                                            <th className="mdl-data-table__cell--non-numeric">Spatial Attributes</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/* Iteratively list all the attributes */}
                                        {spatialattributes.map((d)=>{
                                            return (
                                                <tr key={d.id} style={
                                                    (()=>{
                                                        if(d.id===this.state.spatial){return selectedStyle;}
                                                    })()
                                                }
                                                    onClick={()=>this.setState({spatial: d.id})}>
                                                    <td className="mdl-data-table__cell--non-numeric">{d.name}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                    </div>
                    <div className="mdl-card__actions">
                        <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent">
                            {/* TODO implement View Histogram */}
                            View Attribute Histogram
                        </a>
                        <div className="mdl-layout-spacer"></div>
                        <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                            onClick={()=>{}}
                        >
                            Set
                        </a>
                    </div>
                </div>
            </div>

        );

    }
}


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

    }

    componentDidMount(){
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
            loading: true
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
            spatialAttrs: spatialattributes
        });


        this.setState({
            loading: false
        });
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
        const {viewport, mode, loading, datasets} = this.state;

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
                />
            )
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