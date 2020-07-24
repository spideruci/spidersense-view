import React, { Component } from 'react';

class Overview extends Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.state = {
            currentTextName: "Test",
            currentLinesOfCode: 55
        }
    } 


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
    render() {
        return (
            <div className="fileInfoHeader">
                <div>
                    <p>File Name:</p>
                    <p>{this.state.currentTextName}</p>
                </div>
                <div>
                    <p>Lines of code:</p>
                    <p>{this.state.currentLinesOfCode}</p>
                </div>
            </div>
        );
    }
}

export default Overview;
