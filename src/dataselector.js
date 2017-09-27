import React,{Component} from 'react';

class DataSelector extends Component{
    render(){
        const {datasets} = this.props;
        let componentStyle = {
            position: 'absolute',
            left: '1%',
            top: '1%'
        };
        return (
            <div className='data-selector' style={componentStyle}>
                <table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
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
                                    onClick={()=>{this.props.onDataSelect(d.id);}}>{d.name}</td>
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
        const {nonspatialattributes, spatialattributes, onViewHistogram} = this.props;

        let componentStyle = {
            position: 'absolute',
            left: '1%',
            top: '1%',
            width: '50%'
        };

        let selectedStyle = {
            background: "#4bd3ff"
        };

        return (
            <div className="attribute-selector" style={componentStyle}>
                <div style={{width: "100%", background:'rgba(0,0,0,0.5)'}} className="mdl-card mdl-shadow--2dp">
                    <div className="mdl-card__title mdl-card--expand">
                        <div className="mdl-grid">
                            <div style={{color: 'lightgray'}} className="mdl-cell mdl-cell--12-col">
                                <h2>Select Observation Attributes</h2>
                            </div>
                        </div>
                        <div className="mdl-grid">
                            <div className="mdl-cell mdl-cell--6-col">
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
                            </div>
                            <div className="mdl-cell mdl-cell--6-col">
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
                            </div>
                        </div>
                    </div>
                    <div className="mdl-card__actions">
                        <a onClick={onViewHistogram} className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent">
                            {/* TODO implement View Histogram */}
                            View Attribute Histogram
                        </a>
                        <div className="mdl-layout-spacer"></div>
                        <a className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                           onClick={()=>{}}
                        >
                            Set
                        </a>
                    </div>
                </div>
            </div>

        );

    }
}

export {DataSelector, AttributeSelector};