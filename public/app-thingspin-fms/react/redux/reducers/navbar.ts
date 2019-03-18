export enum TS_NAV_ACTION_TYPES {
  UPDATE_VIEWMODE = 'THINGSPIN_NAV_UPDATE_VIEW_MODE',
  UPDATE_FAVICON = 'THINGSPIN_NAV_UPDATE_FAVICON',
  UPDATE_ALARM_EMERGENCY = 'THINGSPIN_NAV_UPDATE_ALARM_EMERGENCY',
}

export interface TsNavbarPayload {
  faviconPath?: string;
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
  payload: any;
}

export const initialState: TsNavbarPayload = {
  faviconPath: 'public/img/thingspin/thingspin_icon.svg',
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
    case TS_NAV_ACTION_TYPES.UPDATE_FAVICON: {
      return { ...state, faviconPath: action.payload };
    }
    case TS_NAV_ACTION_TYPES.UPDATE_ALARM_EMERGENCY: {
      return { ...state, isEmergency: action.payload };
    }
  }
  return state;
};
