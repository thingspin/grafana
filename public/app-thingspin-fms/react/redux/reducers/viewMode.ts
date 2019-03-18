export enum ViewModeActionTypes {
  TS_UPDATE_VIEWMODE = 'THINGSPIN_UPDATE_VIEW_MODE',
}

export interface ViewModePayload {
  kiosk: any;
}

export interface UpdateViewModeAction {
  type: ViewModeActionTypes;
  payload: ViewModePayload;
}

export const initialState: ViewModePayload = {
  kiosk: '',
};

export const viewModeReducer = (state = initialState, action: UpdateViewModeAction): ViewModePayload => {
  switch (action.type) {
    case ViewModeActionTypes.TS_UPDATE_VIEWMODE: {
      return { ...state, kiosk: action.payload };
    }
  }
  return state;
};
