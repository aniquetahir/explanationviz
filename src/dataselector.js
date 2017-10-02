import React,{Component} from 'react';
import {Grid, Cell} from 'react-mdl';
class DataSelector extends Component{
    render(){
        const {datasets} = this.props;
        let componentStyle = {
            width: '90%',
            margin: 'auto'
        };
        return (
            <div className='data-selector' style={componentStyle}>
                <h2>Select Dataset</h2>
                <table style={{width: '100%'}} className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                    <thead>
                    <tr>
                        <th className="mdl-data-table__cell--non-numeric">Dataset Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Iteratively list all the datasets */}
                    {datasets.map((d)=>{
                        return (
                            <tr key={d.id}>
                                <td className="mdl-data-table__cell--non-numeric"
                                    onClick={()=>{this.props.onDataSelect(d.id);}}>{d.title}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );

    }
}


class AttributeSelector extends Component{
    constructor(props){
        super(props);
        this.state = {
            nonspatial: 0,
            spatial: 0
        }
    }
    render(){
        const {nonspatialattributes, spatialattributes, onAttributeSet} = this.props;
        const componentStyle = {
            width: '90%',
            margin: 'auto'
        };

        const selectedStyle = {
            background: "#4bd3ff"
        };

        return (
                <div className="attribute-selector" style={componentStyle}>
                <Grid>
                    <Cell col={12}>
                        <h4>Select Observation Attributes</h4>
                    </Cell>
                </Grid>
                <Grid>
                    <Cell col={12}>
                        <table style={{width: '100%'}} className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                            <thead>
                            <tr>
                                <th className="mdl-data-table__cell--non-numeric">Non Spatial Attributes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* Iteratively list all the attributes */}
                            {nonspatialattributes.map((d)=>{
                                return (
                                    <tr key={d.id} style={
                                        (()=>{
                                            if(d.id===this.state.nonspatial){return selectedStyle;}
                                        })()
                                    }
                                        onClick={()=>this.setState({nonspatial: d.id})}>
                                        <td className="mdl-data-table__cell--non-numeric">{d.name}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </Cell>
                </Grid>

                <Grid>
                    <Cell col={12}>
                        <table style={{width: '100%'}} className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
                            <thead>
                            <tr>
                                <th className="mdl-data-table__cell--non-numeric">Spatial Attributes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* Iteratively list all the attributes */}
                            {spatialattributes.map((d)=>{
                                return (
                                    <tr key={d.id} style={
                                        (()=>{
                                            if(d.id===this.state.spatial){return selectedStyle;}
                                        })()
                                    }
                                        onClick={()=>this.setState({spatial: d.id})}>
                                        <td className="mdl-data-table__cell--non-numeric">{d.name}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </Cell>
                </Grid>
                <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                   onClick={()=>{onAttributeSet(this.state.nonspatial, this.state.spatial);}}
                >
                    Set
                </a>

            </div>

        );



    }
}

export {DataSelector, AttributeSelector};