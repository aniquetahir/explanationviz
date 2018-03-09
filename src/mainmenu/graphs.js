import React,{Component} from 'react';




import * as echarts from 'echarts';


import _ from 'lodash';

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
            <ContextMenuTrigger id={"menuShowViz"} >
                <div ref={node=>this.graph_node=node}
                     style={{width: "100%", height: "300px", margin: 0, padding: '2px'}} />
            </ContextMenuTrigger>
        );
    }
}

class GraphListView extends Component{
    constructor(props){
        super(props);
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




    setSelectedItems(items){
        this.props.setSelectedItems(items);
    }



    showSQL(){
        this.props.showSQL();
    }

    getScatterPlot(){
        this.props.getScatterPlot();
    }

    getHeatmapPlot(){
        this.props.getHeatmapPlot();
    }

    getCartogramPlot(){
        this.props.getCartogramPlot();
    }

    addVariable(){
        this.props.addVariable();
    }

    render(){
        const {data} = this.props;

        let subviews = data.map(
            (datum,i)=>{
                return (
                    <GraphView key={i}
                               setSelectedItems={_.debounce(this.setSelectedItems,300).bind(this)} data={datum} />
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
