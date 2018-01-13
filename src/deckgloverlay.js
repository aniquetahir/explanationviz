import React, {Component} from 'react';
import DeckGL, {OrthographicViewport, PolygonLayer} from 'deck.gl';

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
        const {viewport, data, onHoverPolygon, polyDraw} = this.props;
        if (!data) {
            return null;
        }


        let closedPolygon = polyDraw.slice();
        closedPolygon.push(polyDraw[0]);
        const layers = [
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
                getPolygon: d => closedPolygon,
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