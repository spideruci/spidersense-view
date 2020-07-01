import React, { Component } from 'react';

class Error extends React.Component {
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
            <div>
                <p>The page does not exist</p>
             </div>
         );
     }
}

export default Error;