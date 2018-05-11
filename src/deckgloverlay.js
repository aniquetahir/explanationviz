import React, {Component} from 'react';
import DeckGL, {OrthographicViewport, PolygonLayer, ScatterplotLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component{
    constructor(){
        super();
        this.state={
            data: null,
            hoveredItem: null
        }
    }

    _initialize(gl){
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }


    _renderTooltip() {
        // const {hoveredItem} = this.state;
        // if (hoveredItem && hoveredItem.index >= 0) {
        //     const {formatTooltip} = settings;
        //     const info = formatTooltip ? formatTooltip(hoveredItem.object) : hoveredItem.index;
        //     return info && (
        //         <div className="tooltip"
        //              style={{left: hoveredItem.x, top: hoveredItem.y}}>
        //             { info.toString().split('\n')
        //                 .map((str, i) => <p key={i}>{str}</p>) }
        //         </div>
        //     );
        // }
        // return null;
    }

    render() {
        const {viewport, data, onHoverPolygon, polyDraw, scatterdata} = this.props;
        if (!data) {
            return null;
        }


        let closedPolygon = polyDraw.slice();
        closedPolygon.push(polyDraw[0]);
        const layers = [
            new ScatterplotLayer({
                id: 'scatterplotlayer',
                data: scatterdata,
                getPosition: d=>d,
                radiusScale: 100,
                getRadius: ()=>1,
                getColor: ()=>[0,200,100]
            }),
            // new PolygonLayer({
            //     id: 'explanationdata',
            //     data: data,
            //     filled: true,
            //     stroked: true,
            //     extruded: false,
            //     opacity: 0.5,
            //     wireframe: false,
            //     pickable: false,
            //     // onHover: d=>onHoverPolygon(d),
            //     getPolygon: d => d.polygon,
            //     getElevation: d => 0,
            //     getFillColor: d => [247,148,0],
            //     getLineColor: d => [255, 255, 255],
            //     getLineWidth: d => 50
            // })
            new PolygonLayer({
                id: 'polygondata',
                data: [{"a":"b"}],
                filled: false,
                stroked: true,
                extruded: false,
                opacity: 1,
                wireframe: false,
                pickable: true,
                onHover: d=>onHoverPolygon(d),
                getPolygon: d => data,
                getElevation: d => 0,
                getFillColor: d => [255,125,125],
                getLineColor: d => [256, 0, 0],
                getLineWidth: d => 100
            })
        ];

        return (
            <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
        );

    }

}