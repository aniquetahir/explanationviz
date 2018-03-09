import React, {Component} from 'react';
import {GridInner as Grid, GridCell as Cell} from 'rmwc/Grid';
import {TextField} from 'rmwc/TextField';
import {List, ListItem, ListItemText, ListItemGraphic} from 'rmwc/List';
import * as echarts from 'echarts';
import _ from 'lodash';
import GraphListView from './mainmenu/graphs';
import {ContextMenu, MenuItem} from 'react-contextmenu';
import {darcula, tomorrow} from 'react-syntax-highlighter/styles/hljs';
import sqlFormatter from "sql-formatter";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
    Dialog,
    DefaultDialogTemplate,
    DialogSurface,
    DialogHeader,
    DialogHeaderTitle,
    DialogBody,
    DialogFooter,
    DialogFooterButton,
    DialogBackdrop
} from 'rmwc/Dialog';

class AttributeGraphList extends Component{
    constructor(props){
        super(props);

        this.state = {
            enabled: false,
            selectedItems: [],
            dialogSQL: "No SQL"

        }
    }
    setSelectedItems(items){
        this.setState({
            selectedItems: items
        });
        console.log(items);
    }

    getSQL(){
        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        let sql = null;
        if(clickedElement!=null) {
            let ylabel = data.ylabel;
            let xlabel = data.xlabel;

            if (ylabel === "Records") {
                ylabel = 'count(*)';
            } else if(ylabel.indexOf('Sum')==0) {
                let elements = _.split(_.join(_.split(ylabel,'Sum('),'Sum(`'),')');
                elements[elements.length-2] += '`';
                ylabel=_.join(elements,')');
            }else if(ylabel.indexOf('Avg')==0){
                let elements = _.split(_.join(_.split(ylabel,'Avg('),'Avg(`'),')');
                elements[elements.length-2] += '`';
                ylabel=_.join(elements,')');
            }else{
                ylabel = '`' + ylabel + '`';
            }

            sql = `
                select ${ylabel} 
                from data
                where \`${xlabel}\` = '${data.x[clickedElement]}'
            `;
        }

        return sql;

    }

    showSQL(){
        this.handleOpenDialog();
        this.setState({
            dialogSQL: this.getSQL()
        });
    }

    getScatterPlot(){
        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        if(clickedElement!=null){
            let xlabel = data.xlabel;

            let sql = `
                select pickup_longitude, pickup_latitude 
                from data
                where ${xlabel} = ${data.x[clickedElement]}
            `;

            this.props.getScatterPlot(sql);
        }
    }

    getHeatmapPlot(){
        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        if(clickedElement!=null){
            let xlabel = data.xlabel;

            let sql = `
                select pickup_longitude, pickup_latitude 
                from data
                where ${xlabel} = ${data.x[clickedElement]}
            `;

            this.props.getHeatmapPlot(sql);
        }
    }

    getCartogramPlot(){
        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        if(clickedElement!=null){
            let xlabel = data.xlabel;

            let sql = `
                select pickup_longitude, pickup_latitude 
                from data
                where ${xlabel} = ${data.x[clickedElement]}
            `;

            this.props.getCartogramPlot(sql);
        }
    }

    addVariable(){
        const {getContext}=this.props;
        const context = getContext();

        let sql = this.getSQL();
        if(sql!=null){
            context.addVariable(sql);
        }
    }

    handleOpenDialog() {
        this.setState({
            openDialog: true
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    render(){
        const {attribute, data} = this.props;
        const {enabled} = this.state;

        let graphViewKey = 0;
        let graphViews = [];


        graphViews.push(
            <div>
                <GraphListView
                    key={++graphViewKey}
                    setSelectedItems={this.setSelectedItems.bind(this)}
                    getScatterPlot = {this.getScatterPlot.bind(this)}
                    getHeatmapPlot = {this.getHeatmapPlot.bind(this)}
                    getCartogramPlot = {this.getCartogramPlot.bind(this)}
                    addVariable = {this.addVariable.bind(this)}
                    getContext = {this.props.getContext}
                    data={data}
                />
                <Dialog
                    open={this.state.openDialog}
                    onClose={evt => this.setState({openDialog: false})}
                >
                    <DialogSurface>
                        <DialogBody>
                            <SyntaxHighlighter language='sql' style={tomorrow} customStyle={{textAlign: "left"}}>
                                {sqlFormatter.format(this.state.dialogSQL)}
                            </SyntaxHighlighter>
                        </DialogBody>
                        <DialogFooter>
                            <DialogFooterButton cancel>Close</DialogFooterButton>
                        </DialogFooter>
                    </DialogSurface>
                    <DialogBackdrop />
                </Dialog>
            </div>

        );


        return (
            <div>
                {graphViews}
                <ContextMenu id={"menuShowViz"}>
                    <MenuItem onClick={this.getCartogramPlot.bind(this)}>
                        Choropleth Map
                    </MenuItem>
                    <MenuItem  onClick={this.getHeatmapPlot.bind(this)}>
                        Heatmap
                    </MenuItem>
                    <MenuItem  onClick={this.getScatterPlot.bind(this)}>
                        Scatterplot
                    </MenuItem>
                    <MenuItem onClick={()=>this.showSQL()}
                    >
                        Show SQL
                    </MenuItem>
                    <MenuItem onClick={()=>this.addVariable()}>
                        Add as Variable
                    </MenuItem>
                </ContextMenu>
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

    searchTermChanged(evt){
        this.debouncedSetState({
           searchTerm: evt.target.value
        });

    }


    render(){
        const {data} = this.props;
        const {searchTerm} = this.state;

        if(!data){
            return null;
        }

        let attributes = _.uniq(_.flatten(data.map(d=>[d.xlabel, d.ylabel])));

        // Filter attributes which match the search term
        attributes = searchTerm===''?[]:attributes.filter(
            attr => attr.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1
        );

        let related_data = data.filter(r=>(attributes.indexOf(r.xlabel)!=-1 || attributes.indexOf(r.ylabel)!=-1));


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
                    <Cell span="12">
                        <TextField outlined
                                   style={{width: '100%'}}
                                   withLeadingIcon="search"
                                   onChange={this.searchTermChanged.bind(this)}
                                   label="Search attribute..." />

                    </Cell>
                </Grid>

                <Grid>
                    <Cell span="12">
                        <AttributeGraphList
                            data={related_data}
                            getScatterPlot={this.props.getScatterPlot}
                            getHeatmapPlot={this.props.getHeatmapPlot}
                            getCartogramPlot={this.props.getCartogramPlot}
                            getContext={this.props.getContext}
                        />
                    </Cell>
                </Grid>


            </div>


        );
    }

}