import { TsMenuPayload, TS_MENU_ACTION_TYPES, UpdateTsMenuAction } from '../actions/tsMenu';
import config from 'app/core/config';

// init
export const initialState: TsMenuPayload = {
    menu: config.bootData.thingspin.menu,
};

// reducer
export const tsTsMenuReducer = (state = initialState, action: UpdateTsMenuAction): TsMenuPayload => {
    switch (action.type) {
        case TS_MENU_ACTION_TYPES.UPDATE_MENU: {
            return { ...state, menu: action.payload };
        }
    }
    return state;
};
