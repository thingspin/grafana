import React from 'react';

import { getBackendSrv } from 'app/core/services/backend_srv';
import { FacilityTreeType, SiteOptions } from './model';

export class SiteModel {
    generateSiteOpts(value: any, label: any, type: FacilityTreeType): SiteOptions {
        let etc: any = {
            isCustom: true,
            icon: <i className="fa fa-industry">&nbsp;&nbsp;</i>,
        };
        switch (type) {
            case FacilityTreeType.Ptag:
                etc = {
                    isCustom: false,
                    icon: <i className="fa fa-plug">&nbsp;&nbsp;</i>,
                };
            break;
        }

        return {
            value,
            label,
            ...etc,
        };
    }

    //BACKEND SRV
    async getFactilitySite(type: FacilityTreeType): Promise<SiteOptions[]> {
        let url = "/thingspin/sites";
        switch (type) {
            case FacilityTreeType.Ptag:
                url = '/thingspin/tagdefine/graph';
                break;
        }

        const result = await getBackendSrv().get(url);

        if (!Array.isArray(result)) {
            console.log("** sites list empty **");
            return [];
        }

        return result.map(({ id, name }) => ( this.generateSiteOpts(id, name, type)) );
    }

    async getTreeinfo(siteId: any, isCustom: boolean): Promise<any[]> {
        //console.log('getTreeinfo');
        const urlAll = `/thingspin/tag`;// get all tags include Custom tag
        const urlOrigin = `/thingspin/sites/${siteId}/facilities/tree`;
        const urlPtag = `/thingspin/tagdefine/graph/${siteId}`; //siteid === connectionId

        const result: any[] = (siteId === -1)
            ? await getBackendSrv().get(urlAll)
            : await getBackendSrv().get(isCustom ? urlOrigin : urlPtag);

        //console.log('getTreeinfo: ', result);
        return (result && result.length) ? result : null;
    }
}

const siteModel = new SiteModel();

export default siteModel;
