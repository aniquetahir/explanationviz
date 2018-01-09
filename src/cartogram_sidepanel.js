import React, {Component} from 'react';
import {List, ListItem, ListItemContent, Grid, Cell} from 'react-mdl';
import * as echarts from 'echarts';
import _ from 'lodash';

export default class CartoSidepanel extends Component {
    constructor(){
        super();
    }
    componentDidMount(){
        this.plotChart()
    }

    componentDidUpdate(){
        this.plotChart()
    }

    plotChart(){
        const {data} = this.props;
        if(!_.isUndefined(this.node)){
            // based on prepared DOM, initialize echarts instance
            let myChart = echarts.init(this.node);

            const rtreedata_inf = data['r_tree'].x.map((x,i)=>{
               return [x, data['r_tree'].influence[i]];
            });

            const rstartreedata_inf = data['r_star_tree'].x.map((x,i)=>{
                return [x, data['r_star_tree'].influence[i]];
            });


            const rtreedata_int = data['r_tree'].x.map((x,i)=>{
                return [x, data['r_tree'].intensity[i]];
            });

            const rstartreedata_int = data['r_star_tree'].x.map((x,i)=>{
                return [x, data['r_star_tree'].intensity[i]];
            });

            // specify chart configuration item and data
            let option = {
                tooltip: {},
                legend: {
                    data:['Influence(R Tree)','Influence(R* Tree)','Intensity(R Tree)','Intensity(R* Tree)']
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Influence(R Tree)',
                        smooth: true,
                        type: 'line',
                        data: rtreedata_inf,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                color: '#ee6218'
                            }
                        }
                    },
                    {
                        name: 'Influence(R* Tree)',
                        smooth: true,
                        type: 'line',
                        data: rstartreedata_inf,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                color: '#2eb5ee'
                            }
                        }
                    },
                    {
                        name: 'Intensity(R Tree)',
                        smooth: true,
                        type: 'line',
                        data: rtreedata_int,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                type: 'dashed',
                                color: '#ee6218'
                            }
                        }
                    },
                    {
                        name: 'Intensity(R* Tree)',
                        smooth: true,
                        type: 'line',
                        data: rstartreedata_int,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                type: 'dashed',
                                color: '#2eb5ee'
                            }
                        }
                    }
                ]
            };

            // use configuration item and data specified to show chart
            myChart.setOption(option);


            myChart.on('click', params => this.displayData(params));
        }

        if(!_.isUndefined(this.selectivity_node)){
            // based on prepared DOM, initialize echarts instance
            let myChart = echarts.init(this.selectivity_node);

            const rtreedata_sel = data['r_tree'].x.map((x,i)=>{
                return [x, data['r_tree'].selectivity[i]];
            });

            const rstartreedata_sel = data['r_star_tree'].x.map((x,i)=>{
                return [x, data['r_star_tree'].selectivity[i]];
            });


            // specify chart configuration item and data
            let option = {
                tooltip: {},
                legend: {
                    data:['Selectivity(R Tree)','Selectivity(R* Tree)']
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Selectivity(R Tree)',
                        smooth: true,
                        type: 'line',
                        data: rtreedata_sel,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                color: '#ee6218'
                            }
                        }
                    },
                    {
                        name: 'Selectivity(R* Tree)',
                        smooth: true,
                        type: 'line',
                        data: rstartreedata_sel,
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                color: '#2eb5ee'
                            }
                        }
                    }
                ]
            };

            // use configuration item and data specified to show chart
            myChart.setOption(option);
            myChart.on('click', params => this.displayData(params));
            //myChart.on('click', _.debounce(params=>console.log(params), 150, {leading: true, trailing: false}).bind(this))
        }
    }

    displayData(params){
        const {data, pltFunc} = this.props;

        let displayData = null;

        if(params.seriesName.indexOf('R Tree')!==-1){
            displayData = data['r_tree'];
        }else if(params.seriesName.indexOf('R* Tree')!==-1){
            displayData = data['r_star_tree'];
        }

        let data_index = displayData.x.indexOf(params.data[0]);
        pltFunc(displayData.zones[data_index]);

    }

    render(){
        const {data} = this.props;

        if(!data){
            return null;
        }

        const style={
            width: '100%'
        };

        // let infoViews = [];
        // let infoViewKey = 0;
        //
        // if(object){
        //     infoViews.push(
        //         <List key={++infoViewKey} style={{width: '100%'}}>
        //             <ListItem twoLine>
        //                 <ListItemContent avatar="info" subtitle={object.id.toString()}>
        //                     Zone ID
        //                 </ListItemContent>
        //             </ListItem>
        //             <ListItem twoLine>
        //                 <ListItemContent avatar="info" subtitle={object.value.toString()}>
        //                     Avg {attribute}
        //                 </ListItemContent>
        //             </ListItem>
        //         </List>
        //     );
        // }

        // let legend = [];
        // if(showLegend){
        //     legend.push(
        //         <div key={++infoViewKey}>
        //             <Grid>
        //                 <Cell col={10}>
        //                     High {attribute}
        //                 </Cell>
        //                 <Cell col={2} style={{background: 'rgb(256,0,0)'}}>
        //                 </Cell>
        //             </Grid>
        //             <Grid>
        //                 <Cell col={10}>
        //                 Low {attribute}
        //                 </Cell>
        //                 <Cell col={2} style={{background: 'rgb(0,256,0)'}}>
        //                 </Cell>
        //             </Grid>
        //         </div>
        //     );
        // }else{
        //     legend.push(
        //         <div key={++infoViewKey}>
        //             <Grid>
        //                 <Cell col={10}>
        //                     Relevant Zone
        //                 </Cell>
        //                 <Cell col={2} style={{background: 'rgb(0,256,0)'}}>
        //                 </Cell>
        //             </Grid>
        //         </div>
        //     );
        // }

        return (
            <Grid className="cartogram-sidepanel" style={style}>
                <Cell col={12}>
                    <div style={{width: "100%", height: "300px", margin: 0, padding: 0}} ref={node=>this.node=node}>

                    </div>
                </Cell>
                <Cell col={12}>
                    <div style={{width: "100%", height: "300px", margin: 0, padding: 0}} ref={node=>this.selectivity_node=node}>

                    </div>
                </Cell>

            </Grid>


        );
    }

}