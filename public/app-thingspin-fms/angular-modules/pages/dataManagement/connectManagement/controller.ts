 import angular from "angular";

import { TsConnect, GroupTsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from "tabulator-tables";

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
    readonly listenerTopic: string = "/thingspin/connect/#" as string;
    mqttClient: TsMqttController; // mqtt client instance

    connectMenuOpen: boolean = false as boolean;
    connectTypeList: string[];
    groupList: GroupTsConnect;
    list: TsConnect[];

    tableInst: any;

    /** @ngInject */
    constructor(private $scope: angular.IScope,
    private $location: angular.ILocationService,
    private $compile: angular.ICompileService, // https://programmingsummaries.tistory.com/132
    private backendSrv: BackendSrv,) { }// Dependency Injection

    $onInit(): void {
        this.asyncUpdateTypeList();
        this.asyncUpdateList();

        this.initMqtt();
        this.initTable();
    }

    $onDestroy(): void {
        if (this.mqttClient) {
            this.mqttClient.end();
        }
    }

    async initMqtt() {
        this.mqttClient = new TsMqttController(this.mqttUrl, this.listenerTopic);
        try {
            await this.mqttClient.run(this.recvMqttMessage.bind(this));
            console.log("MQTT Connected");
        } catch (e) {
            console.error(e);
        }
    }

    recvMqttMessage(topic: string, payload: string | object): void {
        console.log(topic, payload);
    }

    publishMqtt(topic: string, message: string): Error {
        if (!this.mqttClient) {
            const errMsg: string = "MQTT Client is not generated" as string;
            console.error(errMsg);

            return new Error(errMsg);
        }

        return this.mqttClient.publish(topic, message);
    }

    initTable(): void {
        const indexFormatter = (cell: any, formatterParams, onRendered: Function) => {
            const data: TsConnect = cell.getData();
            const index: number = this.list.findIndex((value: TsConnect) => {
                return value.id === data.id;
            });
            return index + 1;
        };

        const typeFormatter = (cell: any, formatterParams, onRendered: Function) => {
            const data: TsConnect = cell.getData();
            const $html = this.$compile(/*html*/`
            <div class="ts-connect-type">
                <div class="${data.type}">${data.type}</div>
            </div>
            `)(this.$scope);
            onRendered((): void => {
                $(cell.getElement()).append($html);
            });
        };

        const actionFormatter = (cell: any, formatterParams, onRendered: Function) => {
            const data: TsConnect = cell.getData();
            const index: number = this.list.findIndex((value: TsConnect) => {
                return value.id === data.id;
            });

            const $html = this.$compile(/*html*/`
                <button class="btn" ng-if="!ctrl.list[${index}].enable" ng-click="ctrl.asyncRun(${data.id}, true)">
                    <i class="fa fa-play"></i>
                </button>
                <button class="btn" ng-if="ctrl.list[${index}].enable" ng-click="ctrl.asyncRun(${data.id}, false)">
                    <i class="fa fa-stop"></i>
                </button>
                <button class="btn" ng-click="ctrl.showEdit('${data.type}', ${data.id})">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="btn" ng-click="ctrl.asyncRemoveConnect(${data.id})">
                    <i class="fa fa-trash"></i>
                </button>
            `)(this.$scope);

            onRendered((): void => {
                $(cell.getElement()).append($html);
            });
        };

        this.tableInst = new Tabulator("#ts-tabulator", {
            index: 'index',
            layout: "fitColumns",      //fit columns to width of table
            resizableRows: true,       //allow row order to be changed
            columns: [                 //define the table columns
                { title: "No", formatter: indexFormatter, },
                { title: "연결 타입", formatter: typeFormatter, },
                { title: "이름", field: "name", },
                { title: "수집 주기(초)", field: "intervals", },
                { title: "최근 변경 날짜", field: "updated", },
                { title: "동작", formatter: actionFormatter, }
            ],
        });
    }

    async asyncRun(id: number, enable: boolean) {
        if (!confirm(`데이터 수집을 ${enable ? '시작' : '중지'}하시겠습니까?`)) {
            return;
        }

        try {
            await this.backendSrv.patch(`thingspin/connect/${id}/enable`, enable);
        } catch (e) {
            console.error(e);
        }
    }

    showEdit(type: string, id: number) {
        this.$location.path(`/thingspin/manage/data/connect/${type}/${id}`);
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
                this.list = list;
                this.tableInst.replaceData(list);
                // this.groupList = this.genGroupList(list);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async asyncRemoveConnect(id: number): Promise<void> {
        if (!confirm("정말로 삭제하시겠습니까?")) {
            return;
        }

        try {
            await this.backendSrv.delete(`thingspin/connect/${id}`);
            // publish mqtt data
            const list: TsConnect[] = this.list;
            for (const index in list) {
                const item: TsConnect = list[index];

                if (item.id === id) {
                    const baseTopic: string = `/thingspin/connect/${item.flow_id}` as string;
                    this.publishMqtt(`${baseTopic}/status`, '');
                    this.publishMqtt(`${baseTopic}/data`, '');

                    list.splice(parseInt(index, 10), 1);
                    break;
                }
            }
            this.tableInst.setData(list);
        } catch (e) {
            console.error(e);
        }
    }

    async asyncToggleConnect(type: string, id: number): Promise<void> {
        try {
            await this.backendSrv.patch(`thingspin/connect/${id}`, {});

            const list: TsConnect[] = this.list;
            for (const index in list) {
                if (list[index].id === id) {
                    list[index].active = !list[index].active;
                    break;
                }
            }
        } catch (e) {
            console.error(e);
        }

    }

    genGroupList(list: TsConnect[]): GroupTsConnect {
        const result: GroupTsConnect = {};

        for (const item of list) {
            const { type }: { type: string } = item;

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
        this.$location.path(`/thingspin/manage/data/connect/${type}`);
    }
}
