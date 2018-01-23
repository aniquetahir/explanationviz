import React, {Component} from 'react';
import {List, ListItem, ListItemContent, Grid, Cell, Textfield, IconButton, ListItemAction} from 'react-mdl';
import * as echarts from 'echarts';
import _ from 'lodash';
import GraphListView from './mainmenu/graphs';

class AttributeGraphList extends Component{
    constructor(props){
        super(props);

        this.state = {
            enabled: false
        }
    }

    render(){
        const {attribute, data} = this.props;
        const {enabled} = this.state;

        let graphViewKey = 0;
        let graphViews = [];

        if(enabled){
            graphViews.push(
                <GraphListView
                    key={++graphViewKey}
                    getScatterPlot = {this.props.getScatterPlot}
                    getHeatmapPlot = {this.props.getHeatmapPlot}
                    getCartogramPlot = {this.props.getCartogramPlot}
                    getContext = {this.props.getContext}
                    data={data}
                />
            )
        }

        return (
            <div>
                <List>
                    <ListItem>
                        <ListItemContent>{attribute}</ListItemContent>
                        <ListItemAction>
                            <IconButton
                                onClick={()=>this.setState({enabled: !enabled})}
                                name={enabled?"expand_less":"expand_more"} />
                        </ListItemAction>
                    </ListItem>
                </List>
                {graphViews}
            </div>
        );
    }
}

export default class CartoSidepanel extends Component {
    constructor(){
        super();
        this.state = {
            searchTerm: ''
        };
        this.debouncedSetState = _.debounce(this.setState,1000).bind(this);
    }

    searchTermChanged(){
        this.debouncedSetState(
            {
                searchTerm: this.txtSearch.inputRef.value
            }
        );
    }


    render(){
        const {data} = this.props;
        const {searchTerm} = this.state;

        if(!data){
            return null;
        }

        let attributes = _.uniq(_.flatten(data.map(d=>[d.xlabel, d.ylabel])));

        // Filter attributes which match the search term
        attributes = attributes.filter(
            attr => attr.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1
        );

        let attrItemKey = 0;
        let attributeListItems = attributes.map(
            attr=>{
                // Get data related to this attribute
                let related_data = data.filter(d=>(d.xlabel===attr || d.ylabel===attr));
                return (
                    <AttributeGraphList
                        key={++attrItemKey}
                        attribute={attr}
                        data={related_data}
                        getScatterPlot={this.props.getScatterPlot}
                        getHeatmapPlot={this.props.getHeatmapPlot}
                        getCartogramPlot={this.props.getCartogramPlot}
                        getContext={this.props.getContext}
                    />
                );
            }
        );


        const style={
            overflow: 'visible',
            width: '100%',
            height: '-webkit-fill-available'
        };

        const listStyle = {
            width: "100%"
        };
        return (
            <div className="cartogram-sidepanel" style={style}>
                <Grid>
                    <Cell col={12}>
                        <List style={listStyle}>
                            <ListItem>
                                <ListItemContent icon="search">
                                    <Textfield
                                        ref={txtSearch=>this.txtSearch=txtSearch}
                                        onChange={this.searchTermChanged.bind(this)}
                                        label="Search Term (Attribute)"
                                        floatingLabel
                                        style={{width: '300px'}}
                                    />
                                </ListItemContent>
                            </ListItem>
                        </List>
                    </Cell>
                </Grid>

                <Grid>
                    <Cell col={12}>
                        {attributeListItems}
                    </Cell>
                </Grid>


            </div>


        );
    }

}