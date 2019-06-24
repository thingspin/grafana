import { FMMetaPayload, FMMetaAction, FM_META_ACTION_TYPES } from '../actions/FMAction';

// init
console.log(window.location.pathname === '/thingspin/manage/monitoring');
export const initialState: FMMetaPayload = {
    isTreeView: window.location.pathname === '/thingspin/manage/monitoring'
};

// reducer
export const tsFmMetaReducer = (state = initialState, action: FMMetaAction): FMMetaPayload => {
    switch (action.type) {
        case FM_META_ACTION_TYPES.SET_TREE_VIEW: {
            return { ...state, isTreeView: action.payload.isTreeView };
        }
    }
    return state;
};
