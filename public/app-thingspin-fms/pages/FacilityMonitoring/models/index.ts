import { DashboardModel } from 'app/features/dashboard/state';
import { DashboardMeta } from 'app/types';


export class FMDashboardModel extends DashboardModel {
    facilityTags: any;
    site: any;

    constructor(data: any, meta?: DashboardMeta) {
        super(data, meta);
        this.facilityTags = data.facilityTags;
        this.site = data.site;
    }
}
