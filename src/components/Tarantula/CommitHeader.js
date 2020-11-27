import React from 'react'  ;

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CodeIcon from '@material-ui/icons/Code';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import {shortenCommitId, shortenMessage, convertTimestampToDate} from './TaranMenuItem';

const CommitHeader = (props) => {
    const { 
        onClearOrAllButtonClicked,
        onPassedOrFailedButtonClicked,
        requestCoverage,
        onViewScoresClicked,
        onSelectCommitChanged,
        isRequestingCoverage,
        isViewScoresDisabled,
        isButtonGroupDisabled,
        selectedCommit,
        commits,
        submitMarginLeft,
        commitWrapper
    } = props;
    
    return (
        <div id="commitContainer">
            <div id="directoryActions">
                <ButtonGroup size="small" variant="text" color="primary" 
                    aria-label="small text primary button group"
                    disabled={isButtonGroupDisabled}>
                    <Button className="directoryButton" onClick={(e) => onClearOrAllButtonClicked(false, e)}>Clear</Button>
                    <Button className="directoryButton" onClick={(e) => onClearOrAllButtonClicked(true, e)}>All</Button>
                    <Button className="directoryButton" onClick={(e) => onPassedOrFailedButtonClicked(true, e)}>Passed</Button>
                    <Button className="directoryButton" onClick={(e) => onPassedOrFailedButtonClicked(false, e)}>Failed</Button>
                </ButtonGroup>
                <Tooltip title="get coverage">
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isRequestingCoverage}
                        style={{ marginLeft: submitMarginLeft }}
                        onClick={requestCoverage}
                    >
                        Submit
                    </Button>
                </Tooltip>
            </div>

            <div>
                <Tooltip title="view score">
                    <IconButton aria-label="view scores" color="primary" 
                        disabled={isViewScoresDisabled}
                        onClick={onViewScoresClicked}>
                        <CodeIcon />
                    </IconButton>
                </Tooltip>
            </div>

            <div ref={commitWrapper}>
                <FormControl >
                    <InputLabel id="simpleSelectLabelCommit">Commit</InputLabel>
                    <Select
                        labelId="simpleSelectLabelCommit"
                        id="selectCommit"
                        value={selectedCommit}
                        onChange={e => onSelectCommitChanged(e.target.value)}
                    >
                        {
                            commits.map((c) => (
                                <MenuItem className="taranMenuItem" key={c.commitId} value={c.commitId}>
                                    <div>
                                        <p className="menuItemMessage">{shortenMessage(c.message)}</p>
                                        <p>
                                            <span className="menuItemCommitter">
                                                {c.committer || "<invalid-user>"}
                                            </span>
                                            <span className="menuItemDate"> committed on {convertTimestampToDate(c.timestamp)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="menuItemCommitId">{shortenCommitId(c.commitId)}</p>
                                    </div>
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </div>
        </div>
    )
}

export default CommitHeader;