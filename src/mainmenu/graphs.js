import React,{Component} from 'react';
import {Grid, Cell, Card, CardTitle, CardText, CardActions, Button, Dialog, DialogTitle, DialogActions, DialogContent} from 'react-mdl';
import * as echarts from 'echarts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {darcula, tomorrow} from 'react-syntax-highlighter/styles/hljs';
import _ from 'lodash';
import sqlFormatter from "sql-formatter";
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import * as dialogPolyfill from 'dialog-polyfill';

class GraphView extends Component{
    constructor(props){
        super(props);
        this.state = {
            clickedElement: null
        };

        this.deferredSetState = _.debounce(this.setState, 300).bind(this);
        this.boolShowSQL = false;
    }

    componentDidMount(){
        this.plotGraph(this.props.data);
    }

    componentDidUpdate(){
        this.plotGraph(this.props.data);
    }

    plotGraph(data){
        if(!_.isUndefined(this.graph_node) && this.graph_node!=null) {
            let myChart = echarts.init(this.graph_node);
            let option = {
                color: ['#3398DB'],
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {
                        type : 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '6%',
                    containLabel: true
                },
                xAxis: {
                    data: data.x,
                    name: data.xlabel,
                    axisTick: {
                        alignWithLabel: true
                    },
                    nameLocation: 'center',
                    nameGap: 20
                },
                yAxis: {
                    name: data.ylabel
                },
                series: [{
                    name: data.ylabel,
                    type: 'bar',
                    data: data.y
                }]
            };

            myChart.setOption(option);
            myChart.on('contextmenu', (params)=>{
                this.props.setSelectedItems([{index: params.dataIndex, data: data}]);
            });
        }
    }



    render(){
        const {data} = this.props;
        return (
                <Card shadow={0} className="graph_view" style={{width: '100%', height: '300px', margin: 0}}>
                    <CardTitle expand style={{paddingTop: 0, paddingBottom:0}}>
                        <ContextMenuTrigger id={"menuShowViz"} >
                            <div ref={node=>this.graph_node=node}
                                 style={{width: "100%", height: "300px", margin: 0, padding: '2px'}} />
                        </ContextMenuTrigger>
                    </CardTitle>
                    {/*<CardText style = {{textAlign: 'left'}}>*/}
                        {/*<SyntaxHighlighter language='sql' style={darcula} customStyle={{height: '100px'}}>*/}
                            {/*{sqlFormatter.format(data.sql)}*/}
                        {/*</SyntaxHighlighter>*/}
                    {/*</CardText>*/}
                    {/*<CardActions border>*/}
                        {/*<Button raised>Explain</Button>*/}
                    {/*</CardActions>*/}
                </Card>
        );
    }
}

class GraphListView extends Component{
    constructor(props){
        super(props);
        this.state = {
            selectedItems: [],
            dialogSQL: "No SQL"
        };

        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
    }

    componentDidMount(){
        if(!_.isUndefined(this.dialog)) {
            console.log(this.dialog);
            dialogPolyfill.registerDialog(this.dialog);
        }
    }

    componentDidUpdate(){
        if(!_.isUndefined(this.dialog)) {
            dialogPolyfill.registerDialog(this.dialog);
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


    setSelectedItems(items){
        this.setState({
           selectedItems: items
        });
        console.log(items);
    }

    showSQL(){

        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        if(clickedElement!=null){
            let ylabel = data.ylabel;
            let xlabel = data.xlabel;

            if(ylabel==="Trips"){
                ylabel = 'count(*)'
            }

            let sql = `
                select ${ylabel} 
                from data
                where ${xlabel} = ${data.x[clickedElement]}
            `;

            this.handleOpenDialog();
            this.setState({
                dialogSQL: sql
            })
        }
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
        const data = this.state.selectedItems[0].data;
        let clickedElement = this.state.selectedItems[0].index;
        if(clickedElement!=null){
            let ylabel = data.ylabel;
            let xlabel = data.xlabel;

            if(ylabel==="Trips"){
                ylabel = 'count(*)'
            }

            let sql = `
                select ${ylabel} 
                from data
                where ${xlabel} = ${data.x[clickedElement]}
            `;

            sql = sql.replace(new RegExp('tpep_pickup_datetime', 'g'), 'dayofmonth(tpep_pickup_datetime)');
            sql = sql.replace(new RegExp('tpep_dropoff_datetime', 'g'), 'dayofmonth(tpep_dropoff_datetime)');

            context.addVariable(sql);
        }

    }

    render(){
        const {data} = this.props;

        let listIndex = 0;

        let subviews = data.map(
            (datum,i)=>{
                return (
                    <Grid /*style={i==0?{}:{marginTop: '100px'}}*/ key={++listIndex}>
                        <Cell col={12} style={{ margin: 'auto'}}>
                            <GraphView setSelectedItems={_.debounce(this.setSelectedItems,300).bind(this)} data={datum} />
                        </Cell>
                    </Grid>
                );
            }
        );


        return (
            <div>
                {subviews}
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

                <Dialog open={this.state.openDialog} ref={dialog=>this.dialog=dialog==null?null:dialog.dialogRef}>
                    {/*<DialogTitle>SQL</DialogTitle>*/}
                    <DialogContent>
                        <SyntaxHighlighter language='sql' style={tomorrow} customStyle={{textAlign: "left"}}>
                            {sqlFormatter.format(this.state.dialogSQL)}
                        </SyntaxHighlighter>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default GraphListView;
