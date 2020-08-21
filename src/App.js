import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { withCookies } from 'react-cookie';

// import logo from './logo.svg';
import Error from "./components/Error/Error";
import Drawer from "./components/Drawer/Drawer";
import Home from "./components/Home/Home"
import Project from "./components/Project/Project";
import ChooseProject from "./components/ChooseProject/ChooseProject";
import About from "./components/About/About";

import './App.css';

class App extends Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);
    } 


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
    render() {
        return (
            <BrowserRouter>
                <div className="app">
                    <div className="componentDrawer">
                        <Drawer cookies={this.props.cookies} />
                    </div>
                    <div className="componentContent">
                        <Switch>
                            <Route path="/" exact render={(props) => (
                                <Home cookies={this.props.cookies} {...props} />
                            )} />
                            <Route path="/project/:id" component={ Project } />
                            <Route path="/proj" component={ ChooseProject } />
                            <Route path="/about" component={ About } />
                            <Route component={ Error } />
                        </Switch>
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default withCookies(App);
