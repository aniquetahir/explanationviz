import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import MapGL from 'react-map-gl';


class Map extends Component {
    static get defaultViewport() {
        return {
            latitude: 40.7,
            longitude: -73.98,
            zoom: 10,
            maxZoom: 16,
            pitch: 0,
            bearing: 0
        };

    }

    constructor(props){
        super(props);

        this.MAPBOX_TOKEN = 'pk.eyJ1IjoiYW5pcXVlIiwiYSI6ImNpbGplM2lvaTRqa3l1aGtwczh1NTl2dmUifQ.D8r0wSvsF5cjJ3HYKiuMJQ';

        this.state = {
            viewport: {
                ...Map.defaultViewport,
                width: 500,
                height: 20
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this._resize.bind(this));
        this._resize();
    }

    _resize() {
        console.log("whatever");
        console.log(this.mapComponent);
        console.log(ReactDOM.findDOMNode(this.mapComponent));

        this._onChangeViewport({
            width: ReactDOM.findDOMNode(this.mapComponent).parentNode.getBoundingClientRect().width,
            height: ReactDOM.findDOMNode(this.mapComponent).parentNode.getBoundingClientRect().height
        });
    }

    _onChangeViewport(viewport) {
        this.setState({
            viewport: {...this.state.viewport, ...viewport}
        });
    }

    render() {
        const {viewport} = this.state;

        return (
            <MapGL
                {...viewport}
                ref={obj=>this.mapComponent=obj}
                mapStyle="mapbox://styles/anique/ciljdxi3k001daqlu1kdc45l2"
                perspectiveEnabled={true}
                onChangeViewport={this._onChangeViewport.bind(this)}
                mapboxApiAccessToken={this.MAPBOX_TOKEN}
            />
        );
    }

}

export default Map;