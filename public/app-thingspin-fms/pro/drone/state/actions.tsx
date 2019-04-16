import { ThunkResult } from 'app/types';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Project } from '../types';

export enum act {
    LoadProjects = 'GETALL_PROJECT',
    LoadProject = 'GET_PROJECT',
    CreateProject = 'CREATE_PROJECT',
    RemoveProject = 'REMOVE_PROJECT',
}

export interface LoadProjectsAction {
    type: act.LoadProjects;
    payload: Map<string, typeof Project>;
}

export interface LoadProjectAction {
    type: act.LoadProject;
    payload: Project;
}

export type Action = LoadProjectsAction | LoadProjectAction;

export const projectsLoaded = (projects: Map<string, typeof Project>): LoadProjectsAction => ({
    type: act.LoadProjects,
    payload: projects
});

export const projectLoaded = (project: Project): LoadProjectAction => ({
    type: act.LoadProject,
    payload: project
});

export function loadProjectList(): ThunkResult<void> {
    return async (dispatch) => {
        await getBackendSrv().get(`api/drone/projects`).then( (data) => {
            const m = new Map<string, typeof Project>();
            Object.keys(data).forEach(k => { m.set(k, data[k]);});

            dispatch(projectsLoaded(m));
        });

    };
}

export function loadProject(id: string): ThunkResult<void> {
    return async (dispatch) => {
        await getBackendSrv().get(`api/drone/project/` + id).then( (data) => {
            dispatch(projectLoaded(data));
        });
    };
}
