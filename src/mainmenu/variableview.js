import React,{Component} from 'react';
import {Card, CardTitle, Dialog, DialogContent,
    DialogActions, Button, List, Chip, Textfield,
    Grid, Cell, ListItem, ListItemContent, ListItemAction, Icon, Spinner}
    from 'react-mdl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {darcula, tomorrow} from 'react-syntax-highlighter/styles/hljs';
import _ from 'lodash';
import sqlFormatter from "sql-formatter";
import * as dialogPolyfill from 'dialog-polyfill';
import {UnControlled as CodeMirror} from 'react-codemirror2';
import {request} from 'd3-request';
require('codemirror/lib/codemirror.css');
require('codemirror/theme/solarized.css');
require('codemirror/mode/sql/sql');


class ExplanationListView extends Component{
    render() {
        const {explanations, showZones} = this.props;

        let listItems = explanations.map(
            (exp, i) => {
                return (
                    <ListItem key={i} style={{cursor: 'pointer'}} onClick={() => {
                        showZones(exp.cluster.map(z=>parseInt(z)))
                    }}>
                        <ListItemContent>
                            {i+1}. {exp.cluster.length} {exp.cluster.length > 1 ? 'Zones' : 'Zone'}
                        </ListItemContent>
                        <ListItemAction>
                            <Icon name="visibility"/>
                        </ListItemAction>
                    </ListItem>
                );
            }
        );

        return (
            <div style={{width: '100%'}}>
                <Grid>
                    <Cell col={12}>
                        <h3>{explanations.length>0?'Explanations':''}</h3>
                    </Cell>
                    <Cell col={12}>
                        <List>
                            {listItems}
                        </List>
                    </Cell>
                </Grid>

            </div>
        );
    }

}


class VariableView extends Component{
    constructor(props) {
        super(props);
        this.state = {
            dialogSQL: '',
            newVariable: 'SELECT count(*) FROM data',
            processing: false,
            explanations: [],
            isLoading: false
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
        if (!_.isNil(this.dialog)) {
            dialogPolyfill.registerDialog(this.dialog);
        }

        if (!_.isNil(this.code_dialog)) {
            dialogPolyfill.registerDialog(this.code_dialog);
        }
    }

    componentDidUpdate(){
        if (!_.isNil(this.dialog)) {
            dialogPolyfill.registerDialog(this.dialog);
        }

        if (!_.isNil(this.code_dialog)) {
            dialogPolyfill.registerDialog(this.code_dialog);
        }
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

    render() {
        const {variables} = this.props;

        const style = {
            position: 'absolute',
            right: '10px',
            top: '10px',
            width: '512px',
            height: '90%',
            overflowY: 'scroll'
        };

        if(!variables){
            return null;
        }


        let listItems = variables.map((v, i) => {
            return (
                <Chip key={i} onClose={() => this.removeVariable(i)}
                      // onClick={() => this.showSQL(v)}
                >
                    <span style={{cursor: 'pointer'}} onClick={()=>this.showSQL(v)}>q{i+1}</span>
                </Chip>
            )
        });

        return (
            <div>
                <Card style={style}>
                    <CardTitle expand>
                        <div style={{width: '100%', margin: 'auto'}}>
                            <Grid>
                                <Cell col={12}>
                                    <h3>Variables</h3>
                                </Cell>
                                <Cell col={12}>
                                    <div>{listItems}</div>
                                </Cell>
                            </Grid>
                            <Grid>
                                <Cell col={12}>
                                    <Button raised colored onClick={()=>this.handleOpenCodeDialog()}>Add Custom Variable</Button>
                                </Cell>
                            </Grid>

                            <Grid>
                                <Cell col={12}>
                                    <Textfield
                                        onChange={e => this.expression=e.target.value}
                                        label="Expression e.g. q1/q2"
                                        floatingLabel
                                        style={{width: '100%'}}
                                    />
                                </Cell>
                            </Grid>

                            <Grid>
                                <Cell col={6}>
                                    <Textfield
                                        onChange={e => this.minSel=e.target.value}
                                        pattern="-?[0-1]*(\.[0-9]+)?"
                                        error="Input is not a valid selectivity!"
                                        label="Min Selectivity"
                                        floatingLabel
                                    />
                                </Cell>
                                <Cell col={6}>
                                    <Textfield
                                        onChange={e => this.maxSel=e.target.value}
                                        pattern="-?[0-1](\.[0-9]+)?"
                                        error="Input is not a valid selectivity!"
                                        label="Max Selectivity"
                                        floatingLabel
                                    />
                                </Cell>
                            </Grid>

                            <Grid>
                                <Cell col={6}>
                                    <Textfield
                                        onChange={e => this.a=e.target.value}
                                        pattern="-?[0-1](\.[0-9]+)?"
                                        error="Input is not a valid number!"
                                        label="Explanation Coefficient"
                                        floatingLabel
                                    />
                                </Cell>
                                <Cell col={6}>
                                    <Textfield
                                        onChange={e => this.k=e.target.value}
                                        pattern="-?[0-9]*?"
                                        error="Input is not an integer!"
                                        label="Number of Explanations"
                                        floatingLabel
                                    />
                                </Cell>
                            </Grid>

                            <Grid>
                                <Cell col={9}>
                                    <Button style={{float: 'right'}} raised colored
                                        onClick={()=>this.requestExplanation()}
                                    >
                                        Explain
                                    </Button>
                                </Cell>
                                <Cell col={3}>
                                    {this.state.isLoading?<Spinner />:<div></div>}
                                </Cell>
                            </Grid>
                            <ExplanationListView explanations={this.state.explanations} showZones={this.showZones.bind(this)} />
                        </div>

                    </CardTitle>
                </Card>
                <Dialog open={this.state.openDialog}
                        ref={dialog => this.dialog = dialog == null ? null : dialog.dialogRef}>
                    <DialogContent>
                        <SyntaxHighlighter language='sql' style={tomorrow} customStyle={{textAlign: "left"}}>
                            {sqlFormatter.format(this.state.dialogSQL)}
                        </SyntaxHighlighter>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseDialog}>Close</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.openCodeDialog}
                        style={{width: '70%', textAlign: 'left'}}
                        ref={dialog => this.code_dialog = dialog == null ? null : dialog.dialogRef}>
                    <DialogContent>
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
                    </DialogContent>
                    <DialogActions>

                        <Button type='button'   onClick={this.handleCloseCodeDialog}>Close</Button>
                        <Button type='button'
                                ripple
                                onClick={()=>{
                                    this.addVariable(this.state.newVariable);
                                    this.handleCloseCodeDialog();
                                }}>
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

}

export default VariableView;