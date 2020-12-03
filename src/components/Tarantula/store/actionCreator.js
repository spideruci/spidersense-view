import * as constants from './constants'
import { spidersenseWorkerUrls } from '../../../vars/vars'
import { extractSourceNameFromRawGithubUrl, extractFileNameFromSourceName} from '../../../util/file-name-parser';
import { fromJS } from 'immutable'

export const resetComponent = () => ({
    type: constants.RESET_COMPONENT
})

export const updateSelectedCommit = (commitId) => ({
    type: constants.SET_COMMIT,
    data: commitId
})

export const updateRequestingCoverage = (isRequesting) =>({
    type: constants.SET_REQUESTING_COVERAGE,
    data: isRequesting
})

export const updateRequestingFromWorker = (isRequesting) => ({
    type: constants.SET_REQUESTING_FROM_WORKER,
    data: isRequesting
})

export const updateButtonGroupDisabled = (disabled) => ({
    type: constants.SET_BUTTON_GROUP_DISABLED,
    data: disabled
})

export const updateAllFiles = (files) => ({
    type: constants.SET_ALL_FILES,
    data: fromJS(files)
})

export const updateAllFileNames = (fileNames) => ({
    type: constants.SET_ALL_FILE_NAMES,
    data: fromJS(fileNames)
})

export const updateSelectionIndex = (index) => ({
    type: constants.SET_SELECTION_INDEX,
    data: index
})

export const updateNumberOfSvgs = (number) => ({
    type: constants.SET_NUMBER_OF_SVGS,
    data: number
})

export const updateMinimapMaxHeights = (heights) => ({
    type: constants.SET_MINIMAP_MAX_HEIGHTS,
    data: fromJS(heights)
})

export const updateScrollContainerHeight = (height) => ({
    type: constants.SET_SCROLL_CONTAINER_HEIGHT,
    data: height
})

export const updateTotalBatches = (num) => ({
    type: constants.SET_TOTAL_BATCHES,
    data: num
})

export const updateRetrievedBatches = (num) => ({
    type: constants.SET_RETRIEVED_BATCHES,
    data: num
})

export const updateTestCases = (testcases) => ({
    type: constants.SET_TEST_CASES,
    data: fromJS(testcases)
})

export const updateSuspiciousness = (sus) => ({
    type: constants.SET_SUSPICIOUSNESS,
    data: fromJS(sus)
})

export const updateViewScoresDisabled = (disabled) => ({
    type: constants.SET_VIEW_SCORES_DISABLED,
    data: disabled
})

export const updateDialogOpened = (isOpened) => ({
    type: constants.SET_DIALOG_OPENED,
    data: isOpened
})

export const updateSuspDialogOpened = (isOpened) => ({
    type: constants.SET_SUSP_DIALOG_OPENED,
    data: isOpened
})

export const updateCoverableIndex = (index) => ({
    type: constants.SET_COVERABLE_INDEX,
    data: index
})

export const updateAllFormatedTestsMap = (testsMap) => ({
    type: constants.SET_ALL_FORMATED_TESTS_MAP,
    data: fromJS(testsMap)
})