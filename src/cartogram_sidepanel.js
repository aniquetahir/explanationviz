import React, {Component} from 'react';
import {List, ListItem, ListItemContent, Grid, Cell} from 'react-mdl';

export default class CartoSidepanel extends Component {
    render(){
        const {object, attribute, showLegend} = this.props;

        if(!attribute){
            return null;
        }

        let infoViews = [];
        let infoViewKey = 0;

        if(object){
            infoViews.push(
                <List key={++infoViewKey} style={{width: '100%'}}>
                    <ListItem twoLine>
                        <ListItemContent avatar="info" subtitle={object.id.toString()}>
                            Zone ID
                        </ListItemContent>
                    </ListItem>
                    <ListItem twoLine>
                        <ListItemContent avatar="info" subtitle={object.value.toString()}>
                            Avg {attribute}
                        </ListItemContent>
                    </ListItem>
                </List>
            );
        }


        const style={
            width: '100%'
        };

        let legend = [];
        if(showLegend){
            legend.push(
                <div key={++infoViewKey}>
                    <Grid>
                        <Cell col={10}>
                            High {attribute}
                        </Cell>
                        <Cell col={2} style={{background: 'rgb(256,0,0)'}}>
                        </Cell>
                    </Grid>
                    <Grid>
                        <Cell col={10}>
                        Low {attribute}
                        </Cell>
                        <Cell col={2} style={{background: 'rgb(0,256,0)'}}>
                        </Cell>
                    </Grid>
                </div>
            );
        }else{
            legend.push(
                <div key={++infoViewKey}>
                    <Grid>
                        <Cell col={10}>
                            Relevant Zone
                        </Cell>
                        <Cell col={2} style={{background: 'rgb(0,256,0)'}}>
                        </Cell>
                    </Grid>
                </div>
            );
        }

        return (
            <Grid className="cartogram-sidepanel" style={style}>
                <Cell col={12}>
                    {/* Legend for the Cartogram */}
                    {legend}
                    {/* Additional views explaining the data */}
                    <Grid>
                        <Cell col={12}>
                            {infoViews}
                        </Cell>
                    </Grid>
                    {/*<Grid>*/}
                        {/*<Cell col={12}>*/}
                            {/**Click on Zone to select spatial observation*/}
                        {/*</Cell>*/}
                    {/*</Grid>*/}

                </Cell>

            </Grid>


        );
    }

}