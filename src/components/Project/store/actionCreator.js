import * as constants from './constants'
import { fromJS } from 'immutable'

export const updateProject = (project) => ({
    type: constants.SET_PROJECT,
    data: fromJS(project)
})

export const updateBackdropOpen =  (isOpen) => ({
    type: constants.SET_BACKDROP_OPEN,
    data: isOpen
})

export const updateCurrentTabIndex = (index) => ({
    type: constants.SET_CURRENT_TAB_INDEX,
    data: index
})