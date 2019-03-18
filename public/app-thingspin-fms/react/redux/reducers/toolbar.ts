// define action type
export enum TS_TOOLBAR_ACTION_TYPES {
  SET_ITEM = 'THINGSPIN_TOOLBAR_SET_ITEM',
  ADD_ITEM = 'THINGSPIN_TOOLBAR_ADD_ITEM',
  REMOVE_ITEM = 'THINGSPIN_TOOLBAR_REMOVE_ITEM',
}

export interface ToolbarItem {
  icon: string;
  title: string;
  link: string;
}

// payload format
export interface TsToolbarPayload {
  enable?: boolean;
  list?: ToolbarItem[];
}

// action format
export interface UpdateNavbarAction {
  type: TS_TOOLBAR_ACTION_TYPES;
  payload: any;
}

// init
export const initialState: TsToolbarPayload = {
  enable: false,
  list: [],
};

// reducer
export const tsToolbarReducer = (state = initialState, action: UpdateNavbarAction): TsToolbarPayload => {
  switch (action.type) {
    case TS_TOOLBAR_ACTION_TYPES.ADD_ITEM: {
      state.list.push(action.payload);
      return { ...state };
    }
    case TS_TOOLBAR_ACTION_TYPES.SET_ITEM: {
      state.list.push(action.payload);
      return { ...state, list: action.payload };
    }
  }
  return state;
};
