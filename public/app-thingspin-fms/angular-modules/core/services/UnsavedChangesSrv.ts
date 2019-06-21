import angular, { ITimeoutService, ILocationService, IRootScopeService, IWindowService } from "angular";
import { ChangeTracker } from "app/features/dashboard/services/ChangeTracker";
import { ContextSrv } from 'app/core/services/context_srv';

export interface FmUnsavedChangesSrv {
    tracker: any;

    init(dsahboard, scope): any;
    fmInit(dashboard, scope): any;
}

class FmChangeTracker extends ChangeTracker {
    protected $rc: any; // $rootScope
    protected $to: ITimeoutService; // $timeout

    constructor(dashboard, scope, originalCopyDelay, $location, $window, $timeout, contextSrv, $rootScope) {
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
        this.$rc.appEvent('save-fm-dashboard');
    }
}

// Override serivce class in AnularJs (unsavedChangesSrv)
angular.module('grafana.services').decorator('unsavedChangesSrv',
    /** @ngInject */
    ($delegate: any,
        $location: ILocationService,
        $window: IWindowService,
        $timeout: ITimeoutService,
        contextSrv: ContextSrv,
        $rootScope: IRootScopeService
    ) => {
    const self = $delegate as FmUnsavedChangesSrv;

    // Add class method
    self.fmInit = function (dashboard, scope) {
        this.tracker = new FmChangeTracker(dashboard, scope, 1000, $location, $window, $timeout, contextSrv, $rootScope);
        return this.tracker;
    };

    return self;
});
