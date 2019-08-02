
import { ProjectListState, ProjectInfoState } from '../types';
import { LayoutModes } from 'app/core/components/LayoutSelector/LayoutSelector';

import {
    act,
    Action,
} from './actions';

export const initialState: ProjectListState = {
    isLoading: true,
    isAddMode: false,
    layoutMode: LayoutModes.List,
    projects: null,
};

export const projectListReducer = (state = initialState, action: Action): ProjectListState => {
    switch (action.type) {
      case act.LoadProjects: {
        return { ...state, isLoading: false, projects: action.payload };
      }
    }
    return state;
};

export const projectReducer = (state: any = {isLoading: true, project: null}, action: Action): ProjectInfoState => {
    switch (action.type) {
      case act.LoadProject: {
        return { ...state, isLoading: false, project: action.payload };
      }
    }
    return state;
};
