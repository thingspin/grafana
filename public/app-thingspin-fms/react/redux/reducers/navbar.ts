// define action type
export enum TS_NAV_ACTION_TYPES {
  UPDATE_VIEWMODE = 'THINGSPIN_NAV_UPDATE_VIEW_MODE',
  UPDATE_FAVICON = 'THINGSPIN_NAV_UPDATE_FAVICON',
  UPDATE_ALARM_EMERGENCY = 'THINGSPIN_NAV_UPDATE_ALARM_EMERGENCY',
  UPDATE_NAV = 'THINGSPIKN_NAV_UPDATE',
}

// payload format
export interface TsNavbarPayload {
  enable: boolean;
  faviconPath?: string;
  kiosk?: any;
  isFullpathTitle?: boolean;
  isEmergency?: boolean;
  enableAlertButton?: boolean;
  enableViewModeButton?: boolean;
  enableRightSidebarButton?: boolean;
  enableUserSettingButton?: boolean;
  enableSearchButton?: boolean;
}

// action format
export interface UpdateNavbarAction {
  type: TS_NAV_ACTION_TYPES;
  payload: any;
}

// init
export const initialState: TsNavbarPayload = {
  enable: true,
  faviconPath: 'public/img/thingspin/thingspin_icon.svg',
  kiosk: '',
  isFullpathTitle: true,
  isEmergency: false,
  enableAlertButton: true,
  enableViewModeButton: true,
  enableRightSidebarButton: true,
  enableUserSettingButton: true,
  enableSearchButton: true,
};

// reducer
export const tsNavbarReducer = (state = initialState, action: UpdateNavbarAction): TsNavbarPayload => {
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
    case TS_NAV_ACTION_TYPES.UPDATE_NAV: {
      return { ...state, ...action.payload };
    }
  }
  return state;
};
