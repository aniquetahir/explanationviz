import React,{Component} from 'react';
import {Grid, Cell, Card, CardTitle, CardText, CardActions, Button} from 'react-mdl';
import * as echarts from 'echarts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/styles/hljs';
import _ from 'lodash';
import sqlFormatter from "sql-formatter";
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';

class GraphView extends Component{
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
        }
    }

    render(){
        const {data} = this.props;
        return (
                <Card shadow={0} className="graph_view" style={{width: '100%', height: '600px', margin: 0}}>
                    <CardTitle expand style={{paddingTop: 0, paddingBottom:0}}>
                        <ContextMenuTrigger id="menuShowViz" >
                            <div ref={node=>this.graph_node=node}
                                 style={{width: "100%", height: "100%", margin: 0, padding: '2px'}} />
                        </ContextMenuTrigger>
                        <ContextMenu id="menuShowViz">
                            <MenuItem onClick={()=>{}}>
                                Cartogram
                            </MenuItem>
                            <MenuItem  onClick={()=>{}}>
                                Heatmap
                            </MenuItem>
                            <MenuItem  onClick={()=>{}}>
                                Scatterplot
                            </MenuItem>
                        </ContextMenu>
                    </CardTitle>
                    <CardText style = {{textAlign: 'left'}}>
                        <SyntaxHighlighter language='sql' style={darcula} customStyle={{height: '100px'}}>
                            {sqlFormatter.format(data.sql)}
                        </SyntaxHighlighter>
                    </CardText>
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
    }

    render(){
        const {data} = this.props;

        let listIndex = 0;

        let subviews = data.map(
            (datum,i)=>{
                return (
                    <Grid style={i==0?{}:{marginTop: '100px'}} key={++listIndex}>
                        <Cell col={12} style={{height: '500px', margin: 'auto'}}>
                            <GraphView data={datum} />
                        </Cell>
                    </Grid>
                );
            }
        );



        return (
            <div>
                {subviews}
            </div>
        );
    }
}

export default GraphListView;
