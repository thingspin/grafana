// 3rd party libs
import angular from "angular";

// Grafana libs
import { ChangeTracker } from "app/features/dashboard/services/ChangeTracker";
import { ContextSrv } from 'app/core/services/context_srv';
import { DashboardModel } from 'app/features/dashboard/state';
import { TsCoreEvents } from 'app-thingspin-fms/types';

export interface AlarmUnsavedChangesSrv {
    tracker: any;

    init(dsahboard: DashboardModel, scope: any): any;
    alarmInit(dashboard: DashboardModel, scope: any): any;
}

class AlarmChangeTracker extends ChangeTracker {
    protected $rc: any; // $rootScope
    protected $to: angular.ITimeoutService; // $timeout

    constructor(
        dashboard: DashboardModel,
        scope: any,
        originalCopyDelay: any,
        $location: angular.ILocationService,
        $window: any,
        $timeout: any,
        contextSrv: ContextSrv,
        $rootScope: any
    ) {
        super(dashboard, scope, originalCopyDelay, $location, $window, $timeout, contextSrv, $rootScope);

        this.$rc = $rootScope;
        this.$to = $timeout;
    }

    // Override
    saveChanges() {
        const self = this;
        const cancel = this.$rc.$on('dashboard-saved', () => {
            cancel();
            this.$to(() => {
                self.gotoNext();
            });
        });
        this.$rc.appEvent(TsCoreEvents.saveAlarmDashboard);
    }
}

// Override serivce class in AnularJs (unsavedChangesSrv)
angular.module('grafana.services').decorator('unsavedChangesSrv',
    /** @ngInject */
    ($delegate: any,
        $location: angular.ILocationService,
        $window: angular.IWindowService,
        $timeout: angular.ITimeoutService,
        contextSrv: ContextSrv,
        $rootScope: angular.IRootScopeService
    ) => {
    const self = $delegate as AlarmUnsavedChangesSrv;

    // Add class method
    self.alarmInit = function (dashboard, scope) {
        this.tracker = new AlarmChangeTracker(dashboard, scope, 1000, $location, $window, $timeout, contextSrv, $rootScope);
        return this.tracker;
    };

    return self;
});
