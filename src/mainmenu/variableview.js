import React,{Component} from 'react';
// import {Card, CardTitle, Dialog, DialogContent,
//     DialogActions, Button, List, Chip, Textfield,
//     Grid, Cell, ListItem, ListItemContent, ListItemAction, Icon, Spinner, Tooltip}
//     from 'react-mdl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {darcula, tomorrow} from 'react-syntax-highlighter/styles/hljs';
import _ from 'lodash';
import sqlFormatter from "sql-formatter";
import * as dialogPolyfill from 'dialog-polyfill';
import {UnControlled as CodeMirror} from 'react-codemirror2';
import {request} from 'd3-request';

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
import {Chip, ChipIcon, ChipSet, ChipText} from 'rmwc/Chip';
import {GridInner as Grid, GridCell as Cell} from 'rmwc/Grid';
import {TextField} from 'rmwc/TextField';
import {Button} from 'rmwc/Button';
import { LinearProgress } from 'rmwc/LinearProgress';


require('codemirror/lib/codemirror.css');
require('codemirror/theme/solarized.css');
require('codemirror/mode/sql/sql');


class ExplanationListView extends Component{
    render() {
        return null;
//         const {explanations, showZones} = this.props;
//
//         let listItems = explanations.map(
//             (exp, i) => {
//                 return (
//                     <ListItem key={i} style={{cursor: 'pointer'}} onClick={() => {
//                         showZones(exp.cluster.map(z=>parseInt(z)))
//                     }}>
//                         <ListItemContent>
//                             <Tooltip label={<span>explanation index: {exp.explanation_index}<br />influence: {exp.influence}<br />intensity: {exp.intensity}</span>}>
//                                 <span>
//                                 {i+1}. {exp.cluster.length} {exp.cluster.length > 1 ? 'Zones' : 'Zone'}
//                                 </span>
//                             </Tooltip>
//                         </ListItemContent>
//                         <ListItemAction>
//                             <Icon name="visibility"/>
//                         </ListItemAction>
//                     </ListItem>
//                 );
//             }
//         );
//
//         return (
//             <div style={{width: '100%'}}>
//                 <Grid>
//                     <Cell col={12}>
//                         <h3>{explanations.length>0?'Explanations':''}</h3>
//                     </Cell>
//                     <Cell col={12}>
//                         <List>
//                             {listItems}
//                         </List>
//                     </Cell>
//                 </Grid>
//
//             </div>
//         );
    }

}
//
//
class VariableView extends Component{
    constructor(props) {
        super(props);
        this.state = {
            dialogSQL: '',
            newVariable: 'SELECT count(*) FROM data',
            processing: false,
            explanations: [],
            isLoading: false,
            isOpen: false
        };

        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
        this.handleOpenCodeDialog = this.handleOpenCodeDialog.bind(this);
        this.handleCloseCodeDialog = this.handleCloseCodeDialog.bind(this);
        this.k='';
        this.minSel='';
        this.maxSel='';
        this.expression='';
        this.a='';
    }

    componentDidMount(){
        // if (!_.isNil(this.dialog)) {
        //     dialogPolyfill.registerDialog(this.dialog);
        // }
        //
        // if (!_.isNil(this.code_dialog)) {
        //     dialogPolyfill.registerDialog(this.code_dialog);
        // }
    }

    componentDidUpdate(){
        // if (!_.isNil(this.dialog)) {
        //     dialogPolyfill.registerDialog(this.dialog);
        // }
        //
        // if (!_.isNil(this.code_dialog)) {
        //     dialogPolyfill.registerDialog(this.code_dialog);
        // }
    }

    handleOpenCodeDialog() {
        this.setState({
            openCodeDialog: true
        });
    }

    handleCloseCodeDialog() {
        this.setState({
            openCodeDialog: false
        });
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

    showSQL(sql){
        this.setState({
            dialogSQL: sql
        });
        this.handleOpenDialog();
    }

    removeVariable(i){
        //window.preventDefault();
        console.log(i);
        const context = this.props.getContext();
        let variables = context.state.variables.slice();
        _.pullAt(variables, [i]);
        context.setState({
            variables: variables
        });

    }

    addVariable(sql){
        console.log(sql);
        if(!_.isNil(sql)){
            const context = this.props.getContext();
            context.addVariable(sql);
        }
    }

    requestExplanation(){
        // Create expression
        let context = this.props.getContext();
        const variables = context.state.variables;
        let expression = this.expression+'';

        variables.forEach((v,i)=>{
            expression = expression.replace(new RegExp(`q${i+1}`,'g'),`%${i+1}$s`);
        });

        this.setState({
            isLoading: true
        });
        request('http://'+window.location.hostname+':8080/explain.json')
            .header("Content-Type", "application/json")
            .timeout(1800000)
            .post(
                JSON.stringify({
                    queries: variables,
                    expression: expression,
                    k: this.k,
                    minSel: this.minSel,
                    maxSel: this.maxSel,
                    a: this.a
                }),
                (err, data)=> {
                    if(err){
                        console.log(err);
                        this.setState({
                            isLoading: false
                        });
                        alert("Failed to calculate explanations. Check log");
                    }else{
                        let explanations = JSON.parse(data.responseText);
                        if(_.isArray(explanations)){
                            this.setState({
                                isLoading: false,
                                explanations: explanations
                            });
                        }else{
                            this.setState({
                                isLoading: false
                            });
                            alert("Failed to calculate explanations. Check log");
                        }


                    }
                }
            );
    }

    showZones(zones){
        const context = this.props.getContext();
        context.displayZones(zones);
    }

    toggleOpen(){
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        const {variables} = this.props;

        const styleClosed = {
            position: 'absolute',
            right: '10px',
            top: '60px',
            background: 'white'
        };

        const style = {
            position: 'absolute',
            right: '10px',
            top: '10px',
            width: '512px',
            height: '90%',
            overflowY: 'scroll',
            background: 'white',
            textAlign: 'left',
            overflow: 'hidden',
            padding: '10px'
        };

        if(!this.state.isOpen){
            return (
                <div style={styleClosed}>
                    <Button raised onClick={()=>{this.toggleOpen()}}>Variables</Button>
                </div>
            );
        }

        if(!variables){
            return null;
        }


        let listItems = variables.map((v, i) => {
            return (
                <Chip key={i}>
                    <ChipText onClick={()=>this.showSQL(v)}>q{i+1}</ChipText>
                    <ChipIcon onClick={() => this.removeVariable(i)} trailing use="close" />
                </Chip>
            )
        });

        return (
            <div style={style}>
                <div style={{width: '100%', margin: 'auto'}}>
                    <Grid>
                        <Cell span="12">
                            <h3>Variables</h3>
                        </Cell>
                    </Grid>
                    <Grid>
                        <Cell span="12">
                            <ChipSet>
                                {listItems}
                            </ChipSet>
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell span="12">
                            <Button raised onClick={()=>this.handleOpenCodeDialog()}>Add Custom Variable</Button>
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell span="12">
                            <TextField
                                outlined
                                onChange={e => this.expression=e.target.value}
                                label="Expression e.g. q1/q2"
                            />
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell span="6">
                            <TextField
                                outlined
                                onChange={e => this.minSel=e.target.value}
                                pattern="-?[0-1]*(\.[0-9]+)?"
                                label="Min Selectivity"
                            />
                        </Cell>
                        <Cell span="6">
                            <TextField
                                outlined
                                onChange={e => this.maxSel=e.target.value}
                                pattern="-?[0-1](\.[0-9]+)?"
                                label="Max Selectivity"
                            />
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell span="6">
                            <TextField
                                outlined
                                onChange={e => this.a=e.target.value}
                                pattern="-?[0-1](\.[0-9]+)?"
                                label="Explanation Coefficient"
                            />
                        </Cell>
                        <Cell span="6">
                            <TextField
                                outlined
                                onChange={e => this.k=e.target.value}
                                pattern="-?[0-9]*?"
                                label="Number of Explanations"
                            />
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell span="5">
                            <Button style={{float: 'right'}} raised
                                    onClick={()=>this.requestExplanation()}
                            >
                                Explain
                            </Button>
                        </Cell>
                        <Cell span="7">
                            <Button style={{float: 'right'}} raised
                                onClick={()=>this.toggleOpen()}
                            >
                                Close
                            </Button>
                        </Cell>
                    </Grid>
                    <Grid>
                        <Cell span="12">
                            {this.state.isLoading?<LinearProgress determinate={false}></LinearProgress>:null}

                        </Cell>
                    </Grid>
                    {/*<ExplanationListView explanations={this.state.explanations} showZones={this.showZones.bind(this)} />*/}
                </div>
                <Dialog
                    open={this.state.openDialog}
                    onClose={evt => this.setState({openDialog: false})}
                >
                    <DialogSurface>
                        <DialogHeader>
                            <DialogHeaderTitle>SQL</DialogHeaderTitle>
                        </DialogHeader>
                        <DialogBody>
                            <SyntaxHighlighter language='sql' style={tomorrow} customStyle={{textAlign: "left"}}>
                                {sqlFormatter.format(this.state.dialogSQL)}
                            </SyntaxHighlighter>
                        </DialogBody>
                        <DialogFooter>
                            <DialogFooterButton cancel>Close</DialogFooterButton>
                            {/*<Button type='button' onClick={this.handleCloseDialog}>Close</Button>*/}
                        </DialogFooter>
                    </DialogSurface>
                    <DialogBackdrop />
                </Dialog>
                <Dialog
                    open={this.state.openCodeDialog}
                    style={{width: '70%', textAlign: 'left'}}
                    onClose={evt => this.setState({openCodeDialog: false})}
                >
                    <DialogSurface>
                        <DialogHeader>
                            <DialogHeaderTitle>Add Variable</DialogHeaderTitle>
                        </DialogHeader>
                        <DialogBody>
                            <CodeMirror
                                value='SELECT count(*) FROM data'
                                options={{
                                    mode: 'text/x-sql',
                                    theme: 'solarized light',

                                    lineNumbers: true
                                }}
                                onChange={(editor, data, value) => {
                                    this.setState({
                                        newVariable: value
                                    })
                                }}
                            />
                        </DialogBody>
                        <DialogFooter>
                            <DialogFooterButton cancel>Cancel</DialogFooterButton>
                            <DialogFooterButton
                                onClick={()=>{
                                    this.addVariable(this.state.newVariable);
                                    this.handleCloseCodeDialog();
                                }}
                            accept>
                                Add
                            </DialogFooterButton>
                        </DialogFooter>
                    </DialogSurface>
                    <DialogBackdrop />
                </Dialog>



            </div>
        );
    }

}

export default VariableView;