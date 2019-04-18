import angular from "angular";
import { TsConnect, GroupTsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    groupList: GroupTsConnect;

    /** @ngInject */
    constructor(private $scope: angular.IScope, private backendSrv: BackendSrv) { }// Dependency Injection

    $onInit(): void {
        this.ayncUpdateList();
    }

    async ayncUpdateList(): Promise<void> {
        try {
            const list = await this.backendSrv.get("thingspin/connect");
            this.groupList = this.getGroupList(list);

            // 데이터 반영
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    getGroupList(list: TsConnect[]): GroupTsConnect {
        const result: GroupTsConnect = {};

        for (const item of list) {
            const { type } = item;

            if (result[type]) {
                result[type].push(item);
            } else {
                result[type] = [item];
            }
        }

        return result;
    }
}
