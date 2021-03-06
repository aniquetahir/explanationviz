import React, {Component} from 'react';
import {List, ListItem, ListItemContent} from 'react-mdl';

class ExplanationView extends Component{
    render() {
        const {explanations, callback} = this.props;
        if(!explanations){
            return null;
        }

        const explanationStyle = {
            position: 'absolute',
            right: '0%',
            top: '0%',
            width: '50%',
            height: '100%',
            background: 'white',
            overflow: 'auto'
        };

        const listItemStyle = {
            cursor: 'pointer'
        };

        let explanationListItems=explanations.map(exp=>{
            return (
                <ListItem>
                    <ListItemContent style={listItemStyle} onClick={()=>{callback(exp);}} icon="assessment">{exp.text}</ListItemContent>
                </ListItem>
            );
        });

        return (
            <div className="explanation-container">
                {/*<div className="explanation-container mdl-shadow--2dp" style={explanationStyle}>*/}
                <List>
                    {explanationListItems}
                </List>
            </div>
        );
    }
}

export default ExplanationView;