import * as constants from './constants'
import { spidersenseWorkerUrls } from '../../../vars/vars'
import {fromJS} from "immutable";

const updateProjects = (projects) => ({
    type: constants.GET_PROJECTS,
    data: fromJS(projects)
})

export const updateViewOptions = (index) => ({
    type: constants.SET_VIEW_INDEX,
    data: index
})

const closeBackdrop = () => ({
    type: constants.CLOSE_BACKDROP,
})

export const getProjects = () => {
    return (dispatch) => {
        fetch(spidersenseWorkerUrls.getAllProjects, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            // Update state to retain projects
            dispatch(updateProjects(data.projects))

            dispatch(updateViewOptions(0))
            dispatch(closeBackdrop())
        }).catch((error) => {
            console.error(error);
            dispatch(closeBackdrop())
        });
    }
}