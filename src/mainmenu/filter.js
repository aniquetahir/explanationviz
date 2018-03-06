import {Component} from 'react';
import {Grid, Cell, Textfield, Menu, Button, MenuItem} from 'react-mdl';
import _ from 'lodash';


export default class FilterView extends Component {

    render(){
        const {data} = this.props;

        let attributeDictionary = {};

        // Get the options for filters from the data
        data.forEach(datum=>{
            let xLabel = datum["xlabel"];
            if(!_.isNil(attributeDictionary[xLabel])){
                attributeDictionary[xLabel] = _.uniq(attributeDictionary[xLabel].push(datum.x));
            }else{
                attributeDictionary[xLabel] = datum.x;
            }
        });

        let attributeFilterComponents = Object.keys(attributeDictionary).map((key, index)=>{
            let btnid = "btn-filter-"+index;
            let menuItems = attributeDictionary[key].map((xValue, xValueIndex)=>{
                return (
                    <MenuItem key={xValueIndex}>
                        xValue
                    </MenuItem>
                );
            });

            return (
               <Grid>
                   <Cell key={index} col={12}>
                       <Button id={btnid}>{key}</Button>
                       <Menu target={btnid} align="right">
                           {menuItems}
                       </Menu>
                   </Cell>
               </Grid>
            );
        });

        return (
            <div>
                <Grid>
                    <Cell col={12}>
                        Filter
                    </Cell>
                </Grid>
                <Grid>
                    <Cell col={12}>
                        <Textfield label="Filter By Predicate"
                                   floatingLabel />
                    </Cell>
                </Grid>
                {attributeFilterComponents}
            </div>
        );
    }
}

