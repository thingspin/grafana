import angular from "angular";
import { TsConnect, GroupTsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    connectMenuOpen: boolean;
    connectTypeList: string[];
    groupList: GroupTsConnect;

    /** @ngInject */
    constructor(private $scope: angular.IScope, private backendSrv: BackendSrv) { }// Dependency Injection

    $onInit(): void {
        this.connectMenuOpen = false;
        this.asyncUpdateTypeList();
        this.asyncUpdateList();
    }

    async asyncUpdateTypeList(): Promise<void> {
        try {
            const list = await this.backendSrv.get("thingspin/type/connect");
            this.connectTypeList = list;

            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async asyncUpdateList(): Promise<void> {
        try {
            const list = await this.backendSrv.get("thingspin/connect");
            if (list) {
                this.groupList = this.getGroupList(list);
                this.$scope.$applyAsync();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async removeConnect(type: string, id: number): Promise<void> {
        try {
            await this.backendSrv.delete(`thingspin/connect/${id}`);
            const list = this.groupList[type];
            for (const index in list) {
                if (list[index].id === id) {
                    list.splice(parseInt(index, 10), 1);
                    break;
                }
            }
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async toggleConnect(type: string, id: number): Promise<void> {
        try {
            await this.backendSrv.patch(`thingspin/connect/${id}`, {});
            const list = this.groupList[type];
            for (const index in list) {
                if (list[index].id === id) {
                    list[index].active = !list[index].active;
                    break;
                }
            }
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

    showConnectMode(enable: boolean): void {
        this.connectMenuOpen = enable;
    }

    changePage(type: string): void {
        history.replaceState({data: `/${type}`,}, "", `/thingspin/manage/data/connect/${type}`);
    }
}
