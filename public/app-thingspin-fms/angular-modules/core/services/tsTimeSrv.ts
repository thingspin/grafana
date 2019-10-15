// Grafana libs
import { coreModule, appEvents } from 'app/core/core';
import { TimeSrv } from "app/features/dashboard/services/TimeSrv";

// Thingspin libs
import { TsCoreEvents } from 'app-thingspin-fms/types';

export interface TsTimeSrv extends TimeSrv {

}

coreModule.decorator('timeSrv',
/** @ngInject */
($delegate: TimeSrv, ) => {
    const self = $delegate as TsTimeSrv;

    // Override service class method
    self.refreshDashboard = () => {
        self.dashboard.timeRangeUpdated(self.timeRange());
        appEvents.emit(TsCoreEvents.tsRefresh);
    };

    return self;
});
