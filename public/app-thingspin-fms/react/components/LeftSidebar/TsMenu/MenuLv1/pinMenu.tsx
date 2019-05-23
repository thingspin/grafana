import { ThunkResult } from 'app/types';
import { getBackendSrv } from 'app/core/services/backend_srv';

export function savePinState(args: any): ThunkResult<void> {
  return async (dispatch, getState) => {
    await getBackendSrv().post(`/thingspin/menu/pin/${args.menuID}/${args.Pinned}`, {});
  };
}

export function getUserPins(): ThunkResult<void> {
  return async (dispatch, getState) => {
    return await getBackendSrv().get(`/thingspin/menu/pin`, {});
  };
}
