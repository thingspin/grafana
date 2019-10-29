// Grafana libs
import { QueryCtrl } from 'app/plugins/sdk';

// thingspin plugin libs
import { TsDsTarget } from '../../models';
import { BackendSrv } from 'app/core/services/backend_srv';
import { setTsPluginBackendSrv } from '../../utils/backendCtrl';

// target에 값을 업데이트하면 datasource에서 options에서 전달받음
export default class FmsQueryCtrl extends QueryCtrl implements angular.IController {
    static templateUrl = require('./index.html');

    inject: angular.auto.IInjectorService;
    dupTarget: TsDsTarget;

    /** @ngInject */
    constructor($scope: angular.IScope,
        $injector: angular.auto.IInjectorService,
        backendSrv: BackendSrv) {
        super($scope, $injector);
        this.inject = $injector;
        setTsPluginBackendSrv(backendSrv);
        this.dupTarget = this.target;
    }

    updateTarget = (siteId: any, tagNodes: any) => {
        this.target.siteId = siteId;
        this.target.tagNodes = tagNodes;

        this.dupTarget = Object.assign(this.target);
        this.refresh();
    }
}
