import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";


// import logo from './logo.svg';
import Error from "./components/Error/Error";
import Drawer from "./components/Drawer/Drawer";
import Home from "./components/Home/Home";
import List from "./components/List/List"
import Analyze from "./components/Analyze/Analyze";

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
                        <Drawer/>
                    </div>
                    <div className="componentContent">
                        <Switch>
                            <Route path="/" component={ Home } exact />
                            <Route path="/list" component={ List } />
                            <Route path="/project" component={ Analyze } />
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

export default App;
