import React from 'react';

import { getBackendSrv } from 'app/core/services/backend_srv';
import { FacilityTreeType, SiteOptions } from './model';

export class SiteModel {
    generateSiteOpts(value: any, label: any, type: FacilityTreeType): SiteOptions {
        let etc: any = {};
        switch (type) {
            case FacilityTreeType.Ptag:
                etc = {
                    isCustom: false,
                    icon: <i className="fa fa-plug">&nbsp;&nbsp;</i>,
                };
                break;
            default:
                etc = {
                    isCustom: true,
                    icon: <i className="fa fa-industry">&nbsp;&nbsp;</i>,
                };
        }

        return {
            value,
            label,
            ...etc,
        };
    }

    //BACKEND SRV
    async getFactilitySite(type: FacilityTreeType): Promise<SiteOptions[]> {
        let url: string;
        switch (type) {
            case FacilityTreeType.Ptag:
                url = '/thingspin/tagdefine/graph';
                break;
            default:
                url = "/thingspin/sites";
        }

        const result = await getBackendSrv().get(url);
        if (!Array.isArray(result)) {
            console.log("** sites list empty **");
            return [];
        }

        return result.map(({ id, name }) => (
            this.generateSiteOpts(id, name, type))
        );
    }

    async getTreeinfo(siteid: any, isCustom: boolean): Promise<any[]> {
        console.log('getTreeinfo');
        const urlOrigin = `/thingspin/sites/${siteid}/facilities/tree`;
        const urlPtag = `/thingspin/tagdefine/graph/${siteid}`; //siteid === connectionId
        //const urlAll = `/thingspin/tagdefine`;
        const urlAll = `/thingspin/tag`;// get all tags include Custom tag

        let result: any[];
        if (siteid === -1) {
            console.log("getAll tag : ",urlAll);
            //const { Result } = await getBackendSrv().get(urlAll);
            //result = Result;
            result = await getBackendSrv().get(urlAll);
        } else {
            const url = isCustom ? urlOrigin : urlPtag;

            result = await getBackendSrv().get(url);
        }
        console.log('getTreeinfo: ',result);
        return (result && result.length) ? result : null;
    }

    //0814
    async getConnectInfo() {
        //const elements = [];
        //const result = await getBackendSrv().get("/thingspin/connect");
    /*
        if (result && result.length > 0) {
            //console.log("getConnectInfo: ", result);
            //this.setState({ sitesListinfo: result });
            for (const { params } of result) {
                console.log("getconnectinfo:", params.FlowId);
            }
        } else {
            console.log("** connect info empty **");
        }
    */
    }
}

const siteModel = new SiteModel();

export default siteModel;
