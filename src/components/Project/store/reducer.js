import * as constants from './constants';
import {fromJS} from "immutable";

const defaultState = fromJS({
    project: {
        // projectId: props.match.params.id,
        projectId: -1,
        projectName: "",
        projectLink: ""
    },
    currentTabIndex: -1,
    backdropOpen: true
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case constants.SET_BACKDROP_OPEN:
            return state.set('backdropOpen', action.data)
        case constants.SET_CURRENT_TAB_INDEX:
            return state.set('currentTabIndex', action.data)
        case constants.SET_PROJECT:
            const project = action.data.toJS();
            return state.updateIn(['project', 'projectId'], (val) => project.projectId)
                        .updateIn(['project', 'projectName'], (val) => project.projectName)
                        .updateIn(['project', 'projectLink'], (val) => project.projectLink);
        default:
            return state;
    }
}