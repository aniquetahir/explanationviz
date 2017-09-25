import React, { Component } from 'react';
import logo from './logo.svg';
import Map from './map.js';
import './App.css';

const STATE_SELECTION = 1;
const STATE_POLYGAMY = 2;
const STATE_AGGRAVATION = 3;
const STATE_INTERVENTION = 4;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW5pcXVlIiwiYSI6ImNpbGplM2lvaTRqa3l1aGtwczh1NTl2dmUifQ.D8r0wSvsF5cjJ3HYKiuMJQ';


class Selection extends Component {
    render() {
        let showPolygamy = ()=>{
            console.log('hello');
            let props = this.props;
            console.log(props);
            this.props.changeState(STATE_POLYGAMY);
        };
        let showAggravation = ()=>{
            this.props.changeState(STATE_AGGRAVATION);
        };
        let showIntervention = ()=>{
            this.props.changeState(STATE_INTERVENTION);
        };
        return (
            <div className="selection">
                <button onClick={showPolygamy}>Data Polygamy</button>
                <button onClick={showAggravation}>Aggravation</button>
                <button onClick={showIntervention}>Intervention</button>
            </div>
        );
    }
}

class Intervention extends Component{
    render(){
        return <Map/>;
    }
}

class Aggravation extends Component{
    render(){
        return <p>Aggravation</p>;
    }
}

class Polygamy extends Component{
    render(){
        return <p>Polygamy</p>;
    }
}


class ModeHolder extends Component{
    render(){
        if(this.props.mode===STATE_AGGRAVATION){
            return <Aggravation />;
        }else if(this.props.mode===STATE_INTERVENTION){
            return <Intervention />
        }else if(this.props.mode===STATE_POLYGAMY){
            return <Polygamy />
        }else{
            return <Selection changeState={this.props.changeState} />
        }

    }
}

class Container extends Component {
    constructor(){
        super();
        this.state = {
            mode: STATE_SELECTION
        }
    }

    componentDidMount(){
        this.setState({
            mode: STATE_SELECTION
        });
    }

    changeState(state){
        this.setState({
            mode: state
        });
    }

    render(){
        let mode=this.state.mode;
        return (
            <div className="container">
                <ModeHolder changeState={this.changeState.bind(this)} mode={mode} />

            </div>
        );
    }
}


class App extends Component {
    render() {
        return (
            <div className="App">
                <Container />
            </div>
        );
    }
}


export default App;
