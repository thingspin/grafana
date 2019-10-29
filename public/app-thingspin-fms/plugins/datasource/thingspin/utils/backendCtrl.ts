// Grafana core libs
import { BackendSrv } from "app/core/services/backend_srv";

// Thingspin plugin libs
import { TsSite } from '../models';
import { getBackendSrv } from '@grafana/runtime';

const baseApi = `/thingspin`;

let backendSrv = getBackendSrv();
export const setTsPluginBackendSrv = (srv: BackendSrv): void => { backendSrv = srv; };
export const getSites = async (): Promise<TsSite[]> => (backendSrv.get(`${baseApi}/sites`));
export const getTree = async (siteId: any) => (backendSrv.get(`${baseApi}/sites/${siteId}/facilities/tree`));
export const getDatasourceByName = async (name: string) => (backendSrv.get(`${baseApi}/datasources/name/${name}`));
// not used
export const getTag = async (id: any): Promise<any> => (backendSrv.get(`${baseApi}/tag/${id}`));
