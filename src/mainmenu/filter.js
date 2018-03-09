import React, {Component} from 'react';
import {GridInner as Grid, GridCell as Cell} from 'rmwc/Grid';
import {Button} from 'rmwc/Button';
import {TextField} from 'rmwc/TextField';
import {Select} from 'rmwc/Select';
import _ from 'lodash';
import { LinearProgress } from 'rmwc/LinearProgress';

export default class FilterView extends Component {
    constructor(props){
        super(props);
        this.state = {
            predicateDict: {},
            isLoading: false
        }
    }
    onSelect(val){
        console.log(val);
        let predicateDict = _.clone(this.state.predicateDict);
        try {
            let [attribute, value] = JSON.parse(val);
            predicateDict[attribute] = value;
        }catch (e){
            delete predicateDict[val];
        }

        this.setState({
            predicateDict:predicateDict
        });

    }

    filter(){
        let predicates = [];
        Object.keys(this.state.predicateDict).forEach(attr=>{
           let attrVal = this.state.predicateDict[attr];
           predicates.push(`\`${attr}\`='${attrVal}'`);
        });

        let where = predicates.join(' AND ');
        console.log(where);

        let context = this.props.getContext();
        this.setState({
            isLoading: true
        });
        context.filterData(where, ()=>{
            this.setState({
                isLoading: false
            });
        })
    }

    render(){
        const {data} = this.props;

        let attributeDictionary = {};

        // Get the options for filters from the data
        data.forEach(datum=>{
            let xLabel = datum["xlabel"];
            if(!_.isNil(attributeDictionary[xLabel])){
                let newArray = attributeDictionary[xLabel];
                newArray.push(datum.x);
                newArray = _.uniq(_.flatten(newArray));
                attributeDictionary[xLabel] = newArray;
            }else{
                attributeDictionary[xLabel] = datum.x;
            }
        });

        let attributeFilterComponents = Object.keys(attributeDictionary).map((key, index)=>{

            return (
               <Grid span="12" key={index} >
                   <Cell span="12">
                       <Select
                           style={{width: '100%'}}
                           onChange={evt=>this.onSelect(evt.target.value)}
                           box
                           label={`Select ${key}`}
                           placeholder={key}
                           options={
                               attributeDictionary[key]
                                   .map(
                                       ele=>{return {label: ele, value: JSON.stringify([key, ele])}}
                                       )
                           }
                       />
                   </Cell>
               </Grid>
            );
        });

        return (
            <div>

                <Grid>
                    <Cell span="6">
                        <TextField outlined label="Filter By Predicate" />
                    </Cell>
                    <Cell span="6">
                        <Button style={{height: '50%', top: '20px'}}
                                onClick={()=>this.filter()} raised>Filter</Button>
                    </Cell>

                </Grid>
                {this.state.isLoading?(<Grid>
                    <Cell span="12">
                        <LinearProgress determinate={false}></LinearProgress>
                    </Cell>
                </Grid>):<div />}
                {attributeFilterComponents}
            </div>
        );
    }
}

