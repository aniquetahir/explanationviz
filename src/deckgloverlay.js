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
        const {viewport, data} = this.props;
        if (!data) {
            return null;
        }

        const sigColorFunc = d=>{
          if(d.feature==1){
              return [0,0,0];
          }else if(d.feature==2){
              return [256,0,0];
          }else{
              return [0,256,0];
          }
        };

        const layers = [
            new PolygonLayer({
                id: 'polygondata',
                data: data.timeline[0].patches,
                filled: true,
                stroked: true,
                extruded: false,
                opacity: 0.7,
                wireframe: false,
                getPolygon: d => d.shape,
                getElevation: d => parseFloat(d.value),
                getFillColor: sigColorFunc,
                getLineColor: d => [256, 256, 256],
                getLineWidth: d => 1
            })
        ];

        return (
            <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
        );

    }

}