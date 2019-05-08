 import angular from "angular";

import { TsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from "tabulator-tables";

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    readonly pageBathPath: string = `/thingspin/manage/data/connect` as string;

    readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
    readonly listenerTopic: string = "/thingspin/connect/#" as string;
    mqttClient: TsMqttController; // mqtt client instance

    connectTypeList: string[];
    list: TsConnect[];

    tableInst: any;

    /** @ngInject */
    constructor(private $scope: angular.IScope,
    // private $element: JQLite,
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

    async initMqtt(): Promise<void> {
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
        const typeFormatter: Function = (cell: any, formatterParams, onRendered: Function) => {
            const data: TsConnect = cell.getData();
            return /*html*/`
            <div class="ts-connect-type">
                <div class="${data.type}">${data.type}</div>
            </div>`;
        };

        const intervalFormatter: Function = (cell: any): string => {
            const data: TsConnect = cell.getData();
            return data.intervals ? `${data.intervals} 초` : "-";
        };

        const updatedFormatter: Function = (cell: any): string => {
            const data: TsConnect = cell.getData();

            return data.updated;
        };

        const actionFormatter = (cell: any, formatterParams, onRendered: Function): void => {
            const data: TsConnect = cell.getData();
            const index: number = this.list.findIndex((value: TsConnect) => {
                return value.id === data.id;
            });
            const $html: JQLite = this.$compile(/*html*/`
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

        const headerClickEvt = (e: any, column: any) => {
            this.$scope.$applyAsync();
        };

        const tableOpts: object = {
            pagination: "local",
            paginationSize: 10,
            layout: "fitColumns",
            // responsiveLayout: true,
            columns: [                 //define the table columns
                { title: "No", formatter: "rownum", headerClick: headerClickEvt, width: 50, },
                { title: "연결 타입", field: "type", formatter: typeFormatter, headerClick: headerClickEvt,},
                { title: "이름", field: "name", headerClick: headerClickEvt, },
                { title: "수집 주기", field: "intervals", formatter: intervalFormatter, headerClick: headerClickEvt, },
                { title: "최근 변경 날짜", field: "updated", formatter: updatedFormatter, headerClick: headerClickEvt, },
                { title: "동작", formatter: actionFormatter, headerClick: headerClickEvt, },
            ],
            renderStarted: () => {
                this.$scope.$applyAsync();
            },
            renderComplete: () => {
                // this.tableInst.redraw();
            }
        };

        this.tableInst = new Tabulator("#ts-connect", tableOpts);
    }

    showEdit(type: string, id: number): void {
        this.$location.path(`${this.pageBathPath}/${type}/${id}`);
    }

    changePage(type: string): void {
        this.$location.path(`${this.pageBathPath}/${type}`);
    }

    async asyncRun(id: number, enable: boolean): Promise<void> {
        if (!confirm(`데이터 수집을 ${enable ? '시작' : '중지'}하시겠습니까?`)) {
            return;
        }

        const index: number = this.list.findIndex((value: TsConnect) => {
            return value.id === id;
        });

        try {
            await this.backendSrv.patch(`thingspin/connect/${id}/enable`, enable);
            this.list[index].enable = enable;
            this.$scope.$applyAsync();

            this.tableInst.replaceData(this.list);
        } catch (e) {
            console.error(e);
        }
    }

    async asyncUpdateTypeList(): Promise<void> {
        try {
            const list: any = await this.backendSrv.get("thingspin/type/connect");
            this.connectTypeList = list;

            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async asyncUpdateList(): Promise<void> {
        try {
            const list: TsConnect[] = await this.backendSrv.get("thingspin/connect");
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
                    const baseTopic: string = `/thingspin/connect/${item.params.FlowId}` as string;
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
}
