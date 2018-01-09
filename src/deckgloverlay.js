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
        const {viewport, data, onHoverPolygon} = this.props;
        if (!data) {
            return null;
        }


        const layers = [
            new PolygonLayer({
                id: 'polygondata',
                data: data,
                filled: true,
                stroked: true,
                extruded: false,
                opacity: 0.7,
                wireframe: false,
                pickable: true,
                onHover: d=>onHoverPolygon(d),
                getPolygon: d => d.polygon[0],
                getElevation: d => 1,
                getFillColor: d => [0,128,128],
                getLineColor: d => [256, 256, 256],
                getLineWidth: d => 20
            })
        ];

        return (
            <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
        );

    }

}