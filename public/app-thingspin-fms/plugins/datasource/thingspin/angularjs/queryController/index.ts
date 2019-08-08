// 3rd party libs
import { IController, IScope, auto } from 'angular';

// Grafana libs
import { QueryCtrl } from 'app/plugins/sdk';

// thingspin plugin libs
import { TsDsTarget } from '../../models';
import { BackendSrv } from 'app/core/services/backend_srv';
import { setTsPluginBackendSrv } from '../../utils/backendCtrl';

// target에 값을 업데이트하면 datasource에서 options에서 전달받음
export default class FmsQueryCtrl extends QueryCtrl implements IController {
    static templateUrl = require('./index.html');

    dupTarget: TsDsTarget;

    /** @ngInject */
    constructor($scope: IScope, $injector: auto.IInjectorService, backendSrv: BackendSrv) {
        super($scope, $injector);
        setTsPluginBackendSrv(backendSrv);
        this.dupTarget = this.target;
        this.updateTarget = this.updateTarget.bind(this);
    }

    async updateTarget(t: any) {
        for (const item in t) {
            this.target[item] = t[item];
        }

        this.dupTarget = Object.assign(this.target);
        this.refresh();
    }
}
