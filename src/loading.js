import React, {Component} from 'react';
import {ProgressBar} from 'react-mdl';

class Loading extends Component{
    render(){
        const style = {
            position: 'absolute',
            bottom: '10%',
            left: '25%',
            width: '50%'
        };

        return (
            <div className="loader" style={style}>
                <ProgressBar indeterminate />
            </div>
        );
    }
}

export default Loading;