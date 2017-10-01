import React, {Component} from 'react';

class HistogramView extends Component{
    render() {
        const {datasetid} = this.props;

        const histogramStyle = {
            position: 'absolute',
            right: '0%',
            top: '0%',
            width: '50%',
            height: '100%',
            background: 'white',
            overflow: 'auto'
        };
        return (
            <div className="histogram-container mdl-shadow--2dp" style={histogramStyle}>
                <img alt="Loading Data..." width="100%" src={"http://localhost:8080/histogram.svg?datasetid="+datasetid} />
            </div>
        );
    }
}

export default HistogramView;