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
import {Grid, Cell, FABButton, Icon} from 'react-mdl';


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
        this.state.explanationdata=null;

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
                                nonspatialattribute: attribute_name,
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
    renderExplanation(exp){
        this.setState({
           loading: true
        });

        // Get attribute
        let attribute_name = exp.nonspatialattribute;

        // Get cartogram for attribute
        requestJson(`http://localhost:8080/cartogram.json?datasetid=${this.state.datasetid}&attributeid=${exp.raw.attribute}`,
            (err, resp)=>{
                if(err){
                    console.log(err);
                }else{
                    let explanationdata = resp;

                    // Figure out if positive or negative salient features matter
                    let interesting_features=null;
                    if(exp.raw.score < 0){
                        interesting_features = exp.raw.negative;
                    }else{
                        interesting_features = exp.raw.positive;
                    }

                    let interesting_zones = interesting_features.map((f)=>{
                        return f.zone;
                    });

                    // modify explanation data to show interesting zones
                    explanationdata.timeline[0].patches =
                        explanationdata.timeline[0].patches.map(p=>{
                            if(interesting_zones.indexOf(p.id)<0){
                                p.feature=1;
                            }else{
                                p.feature=3;
                            }
                            return p;
                        });

                    this.setState({
                        explanationattribute: attribute_name,
                        explanationdata: explanationdata,
                        loading: false,
                        mode: this.MODE_EXPLANATION_VIEW
                    });

                }
            }
        );

    }


    changeHoverObject(object){
        this.setState({
            hoverObject: object
        });
    }

    revertState(){
        let mode = this.state.mode;
        if(mode===this.MODE_ATTRIBUTE_SELECT){
            this.setState({
                mode: this.MODE_DATASET_SELECT
            });
        }else if(mode===this.MODE_HEATMAP_VIEW){
            this.setState({
               mode: this.MODE_ATTRIBUTE_SELECT,
               data: null
            });
        }else if(mode===this.MODE_EXPLANATION_VIEW){
            this.setState({
               mode: this.MODE_HEATMAP_VIEW
            });
        }
    }

    render(){
        const {viewport, mode, loading, datasets, datasetid} = this.state;
        let data = this.state.data;

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
                        showLegend={true}
                  />
            );

            additionalViews.push(
                <ExplanationView key={++additionalViewKey}
                        explanations={this.state.explanations}
                        callback={this.renderExplanation.bind(this)}
                />
            );
        }

        if(mode===this.MODE_EXPLANATION_VIEW){
            additionalViews.push(
                <CartoSidepanel key={++additionalViewKey}
                                object={this.state.hoverObject}
                                attribute={this.state.explanationattribute}
                                showLegend={false}
                />
            );

            data = this.state.explanationdata;
        }


        if(loading){
            outerViews.push(<Loading key={++outerViewKey} />);
        }


        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
                <div className="mdl-layout__drawer">
                    <Grid>
                        <Cell col={3}>
                            <FABButton mini colored onClick={this.revertState.bind(this)}>
                                &lt;
                            </FABButton>
                        </Cell>
                        <Cell col={9}>
                            <span className="mdl-layout-title" style={{padding: 0}}>GeoSpatial Viz</span>
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