import * as constants from './constants';
import {fromJS} from "immutable";

const defaultState = fromJS({
    projects: [],
    currentViewIndex: -1,
    backdropOpen: true
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case constants.GET_PROJECTS:
            return state.merge({
                projects: action.data
            });
        case constants.SET_VIEW_INDEX:
            return state.set('currentViewIndex', action.data);
        case constants.CLOSE_BACKDROP:
            return state.set('backdropOpen', false);
        default:
            return state;
    }
}