// 3rd party libs
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

// grafana libs
import { StoreState } from 'app/types';
import { getBackendSrv } from '@grafana/runtime';

// thingspin libs
import { TS_MENU_ACTION_TYPES } from '../actions/tsMenu';

type TsMenuThunkResult<R> = ThunkAction<R, StoreState, undefined, any>;

export function updateTsMenu(orgId: number): TsMenuThunkResult<void> {
    return async (dispatch: ThunkDispatch<any, any, any>) => {
        const result: any[] = await getBackendSrv().get(`/thingspin/menu/${orgId}`);

        dispatch({
            type: TS_MENU_ACTION_TYPES.UPDATE_MENU,
            payload: result,
        });
    };
}
