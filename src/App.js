import React, { Component } from 'react';
//import logo from './logo.svg';
import DataMap from './datamap.js';
import './App.css';
import {AttributeSelector} from "./dataselector";

const STATE_SELECTION = 1;
const STATE_POLYGAMY = 2;
const STATE_AGGRAVATION = 3;
const STATE_INTERVENTION = 4;


class Evaluation extends Component {
    render(){
        return <DataMap/>;
    }
}

class Container extends Component {

    render(){
        return (
            <div className="container">
                <Evaluation />

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
