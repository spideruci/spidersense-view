import React from 'react';

import ProgressBar from './ProgressBar'
import CircularProgress from '@material-ui/core/CircularProgress';

const CodeContainer = (props) => {
    const { isRequestingCoverage, loadingProgress } = props;

    return (
        <div id="visualizationWrapper">
            {
                isRequestingCoverage &&
                <div id="linearProgress">
                    {/* <div>
                        <CircularProgress color="secondary" />
                        <div id='loadingAllTests'>loading all tests</div>
                    </div> */}
                    <div id='loadingAllTests'>Loading all tests</div>
                    <ProgressBar data={loadingProgress} />
                </div>
            }
            <div id="horizontalScrollView"></div>                      
            <div id="scrollContainer"></div>
        </div>
    )
}

export default CodeContainer