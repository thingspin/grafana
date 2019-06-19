export enum TS_MENU_ACTION_TYPES {
    UPDATE_MENU = 'THINGSPIN_UPDATE_MENU',
}

// action format
export interface UpdateTsMenuAction {
    type: TS_MENU_ACTION_TYPES;
    payload: any;
  }

export interface TsMenuPayload {
    menu: any[];
}

