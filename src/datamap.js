import MapGL from 'react-map-gl';
import Map from './map.js';
import React from 'react';
import HistogramView from './histogramview.js';
import {DataSelector, AttributeSelector} from './dataselector.js'
import Loading from './loading.js';
import {json as requestJson} from 'd3-request';
import _ from 'lodash';
import DeckGLOverlay from './deckgloverlay.js';
import CartoSidepanel from './cartogram_sidepanel.js';
import ExplanationView from "./explanationview";


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
        this.state.hoverObject=null;
        this.state.nonspatialattribute=null;
        this.state.explanations=null;

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

        let dataset = _.find(this.state.datasets,{id: this.state.datasetid});
        let attributename=null;
        if(dataset) {
            let attribute = _.find(dataset.nonspatial, {id: nonspatialatt});
            if(attribute){
                attributename = attribute.name;
            }
        }

        //Show Loading
        this.setState({
            loading: true,
            mode: this.MODE_HEATMAP_VIEW,
            nonspatialattribute: attributename
        });


        // TODO Spatial Attribute Selection/Dataset Id
        let cartogramPromise = new Promise((resolve, reject)=>{
            requestJson(`http://localhost:8080/cartogram.json?datasetid=${this.state.datasetid}&attributeid=${nonspatialatt}`,
                (err, resp)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        console.log(this);
                        resolve(resp);

                    }

                }
            );
        });

        // Explanation Selection
        let explanationPromise = new Promise((resolve, reject)=>{
            requestJson(`http://localhost:8080/explanations.json?attributeid=${nonspatialatt}`,
                (err, resp)=>{
                    if(err){
                        console.log(err);
                        reject();
                    }else{
                        let explanations = resp.map((exp, exp_index)=>{
                            // Get the name of the attribute
                            let attribute_name = _.find(dataset.nonspatial, {id: parseInt(exp.attribute)}).name;
                            let rank = exp_index+1;
                            let explanationText = `${rank}. Explanation with ${attribute_name}`;
                            return {
                                id: exp_index,
                                text: explanationText,
                                raw: exp
                            }
                        });
                        resolve(explanations);
                    }
                }
            );
        });

        Promise.all([cartogramPromise, explanationPromise]).then(([cartogramResp,explanationResp])=>{
            this.setState({
                loading: false,
                data: cartogramResp,
                explanations: explanationResp

            });
        });



    }

    // TODO Implement this
    renderExplanation(){
        alert("Method not implemented");
    }


    changeHoverObject(object){
        this.setState({
            hoverObject: object
        });
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

        if(mode===this.MODE_HEATMAP_VIEW){
            additionalViews.push(
                  <CartoSidepanel key={++additionalViewKey}
                        object={this.state.hoverObject}
                        attribute={this.state.nonspatialattribute}
                  />
            );

            additionalViews.push(
                <ExplanationView key={++additionalViewKey}
                        explanations={this.state.explanations}
                        callback={this.renderExplanation.bind(this)}
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
                                           onHoverPolygon={this.changeHoverObject.bind(this)}
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