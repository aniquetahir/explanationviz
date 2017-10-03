import React, {Component} from 'react';
import {List, ListItem, ListItemContent, Grid, Cell} from 'react-mdl';

export default class CartoSidepanel extends Component {
    render(){
        const {object, attribute} = this.props;
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
                            Average {attribute}
                        </ListItemContent>
                    </ListItem>
                </List>
            );
        }


        const style={
            width: '90%'
        };

        return (
            <Grid className="cartogram-sidepanel" style={style}>
                <Cell col={12}>
                    {/* Legend for the Cartogram */}
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

                </Cell>

                {/* Additional views explaining the data */}
                <Cell col={12}>
                    {infoViews}
                </Cell>

            </Grid>

        );
    }

}