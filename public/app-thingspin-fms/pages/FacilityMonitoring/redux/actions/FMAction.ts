import { store } from 'app/store/store';

export enum FM_META_ACTION_TYPES {
    SET_TREE_VIEW = 'THINGSPIN_SET_TREE_VIEW',
}

export interface FMMetaAction {
    type: FM_META_ACTION_TYPES;
    payload: FMMetaPayload;
}

export interface FMMetaPayload {
    isTreeView: boolean;
}

export function updateFmMetaToggleTreeView() {
    return store.dispatch({
        type: FM_META_ACTION_TYPES.SET_TREE_VIEW,
        payload: {
            isTreeView: !store.getState().thingspinFmMeta.isTreeView,
        }
    });
}

export function setFmMetaTreeView(isTreeView: boolean) {
    return store.dispatch({
        type: FM_META_ACTION_TYPES.SET_TREE_VIEW,
        payload: {
            isTreeView,
        }
    });
}
