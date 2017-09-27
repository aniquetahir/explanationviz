import React, {Component} from 'react';

class HistogramView extends Component {
    render(){
        const {datasetid} = this.props;

        const style = {
            position: 'absolute',
            right: '10%',
            top: '10%'
        };

        return (
            <div className="histogramview" style={style}>
                <img src={"http://localhost:8080/histogram.svg?datasetid="+datasetid} />
            </div>
        );
    }

}

export default HistogramView;