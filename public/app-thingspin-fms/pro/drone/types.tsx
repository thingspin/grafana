//import { loadProjectList } from './state/actions';
//import { appEvents } from 'app/core/core/actions';
import { notifyApp } from 'app/core/actions';

export const DATETIME_DEFAULTFORMAT = `YYYY-MM-DD HH:mm`;
export const DATETIME_FORMAT_SEC = `YYYY-MM-DD HH:mm:SS`;

export class Project {
    id: string;
    name: string;
    site?: string;
    pilot?: string;
    comment?: string;
    begin?: Date;
    end?: Date;
    created?: Date;
    updated?: Date;
}

interface Props {
    params: any;
    store: any;
}

interface State {
    isLoading: boolean;
}

export interface ProjectListProps extends Props {
    loadProjectList: () => Promise<Map<string, typeof Project>>;
    projects: Map<string, typeof Project>;
    notifyApp?: typeof notifyApp;
}

export interface ProjectListState extends State {
    isAddMode: boolean;
    layoutMode: any;
    projects: Map<string, typeof Project>;
}

export interface ProjectInfoProps extends Props {
    onDelete?: (id: string) => void;
    loadProject: (id: string) => Promise<Project>;
}

export interface ProjectInfoState extends State {
    project: Project;
}

export interface MapSearchProps extends Props {
}

export interface MapSearchState extends State {
}

