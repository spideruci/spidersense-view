import { combineReducers } from "redux-immutable";
import { reducer as homeReducer } from '../components/Home/store'
import { reducer as projectReducer } from '../components/Project/store'
import { reducer as tarantulaReducer } from '../components/Tarantula/store'


const reducer = combineReducers({
    home: homeReducer,
    project: combineReducers({
        project: projectReducer,
        tarantula: tarantulaReducer
    })
});

export default reducer;