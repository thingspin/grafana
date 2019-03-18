export enum TS_NAV_ACTION_TYPES {
  UPDATE_VIEWMODE = 'THINGSPIN_NAV_UPDATE_VIEW_MODE',
}

export interface TsNavbarPayload {
  kiosk?: any;
  isEmergency?: boolean;
  enableAlertButton?: boolean;
  enableViewModeButton?: boolean;
  enableVSplitButton?: boolean;
  enableUserSettingButton?: boolean;
  enableSearchButton?: boolean;
}

export interface UpdateViewModeAction {
  type: TS_NAV_ACTION_TYPES;
  payload: TsNavbarPayload;
}

export const initialState: TsNavbarPayload = {
  kiosk: '',
  isEmergency: false,
  enableAlertButton: true,
  enableViewModeButton: true,
  enableVSplitButton: true,
  enableUserSettingButton: true,
  enableSearchButton: true,
};

export const tsNavbarReducer = (state = initialState, action: UpdateViewModeAction): TsNavbarPayload => {
  switch (action.type) {
    case TS_NAV_ACTION_TYPES.UPDATE_VIEWMODE: {
      return { ...state, kiosk: action.payload };
    }
  }
  return state;
};
