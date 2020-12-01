import * as constants from './constants';
import { fromJS } from 'immutable';

const defaultState = fromJS({
    // Commits
    selectedCommit: '',

    // All files
    allFiles: [],

    // Selected File Container
    selectionIndex: -1,
    numberOfSvgs: 0,
    minimapMaxHeights: [],
    scrollContainerHeight: 0,

    // Active test cases
    testcases: [],
    totalBatches: -1,
    retrievedBatches: 0,

    // Fault localization
    suspiciousness: [],

    // Buttons, Progresses, and Dialogs
    isButtonGroupDisabled: true,
    isViewScoresDisabled: true,
    isRequestingFromWorker: false,
    isDialogOpened: false,
    isSuspDialogOpened: false,
    coverableIndex: -1,
    isRequestingCoverage: false,
    allFormatedTestsMap: []
})

export default (state = defaultState, action) => {
    switch (action.type) {
        case constants.RESET_COMPONENT:
            return state.set('selectedCommit', '')
                    .set('allFiles', [])
                    .set('selectionIndex', -1)
                    .set('numberOfSvgs', 0)
                    .set('minimapMaxHeights', [])
                    .set('scrollContainerHeight', 0)
                    .set('testcases', [])
                    .set('suspiciousness', [])
                    .set('isButtonGroupDisabled', true)
                    .set('isButtonGroupDisabled', true)
                    .set('isDialogOpened', false)
                    .set('isSuspDialogOpened', false)
                    .set('coverableIndex', -1)
        case constants.SET_COMMIT:
            return state.set('selectedCommit', action.data);
        case constants.SET_REQUESTING_FROM_WORKER:
            return state.set('isRequestingFromWorker', action.data);
        case constants.SET_REQUESTING_COVERAGE:
            return state.set('isRequestingCoverage', action.data)
        case constants.SET_BUTTON_GROUP_DISABLED:
            return state.set('isButtonGroupDisabled', action.data)
        case constants.SET_SELECTION_INDEX:
            return state.set('selectionIndex', action.data)
        case constants.SET_NUMBER_OF_SVGS:
            return state.set('numberOfSvgs', action.data)
        case constants.SET_MINIMAP_MAX_HEIGHTS:
            return state.merge({
                minimapMaxHeights: action.data
            })
        case constants.SET_TEST_CASES:
            return state.merge({
                testcases: action.data
            })
        case constants.SET_SUSPICIOUSNESS:
            return state.set('suspiciousness', action.data)
        case constants.SET_ALL_FILES:
            return state.merge({
                allFiles: action.data
            })
        case constants.SET_ALL_FORMATED_TESTS_MAP:
            return state.merge({
                allFormatedTestsMap: action.data
            })
        case constants.SET_SCROLL_CONTAINER_HEIGHT:
            return state.set('scrollContainerHeight', action.data)
        case constants.SET_TOTAL_BATCHES:
            return state.set('totalBatches', action.data)
        case constants.SET_RETRIEVED_BATCHES:
            return state.set('retrievedBatches', action.data)
        case constants.SET_SUSP_DIALOG_OPENED:
            return state.set('isSuspDialogOpened', action.data)
        case constants.SET_DIALOG_OPENED:
            return state.set('isDialogOpened', action.data)
        case constants.SET_COVERABLE_INDEX:
            return state.set('coverableIndex', action.data)
        case constants.SET_VIEW_SCORES_DISABLED:
            return state.set('isViewScoresDisabled', action.data)
        default:
            return state;
    }
}