import _ from "lodash";
import angular from "angular";

import { TsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

export interface Banner {
    title: string;
}

export interface TableData {
    // table header data
    rowCount: number; // 페이지당 표시할 행(row) 개수
    selectOpts: number[];
    // table body data
    pageNode: any[];
    // table footer data
    currPage: number;
    maxPage: number;
    maxPageLen: number; // paging 최대 표시 개수
}

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    readonly pageBathPath: string = `/thingspin/manage/data/connect` as string;

    // MQTT
    readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
    readonly listenerTopic: string = "/thingspin/connect/+/status" as string;
    mqttClient: TsMqttController; // mqtt client instance

    // UI Data
    // banner
    banner: Banner = {
        title: "산업용 프로토콜 및 기타 데이터소스에 대한 연결",
    };
    connectTypeList: string[];
    // table
    list: TsConnect[];
    tData: TableData = {
        rowCount: 16,
        selectOpts: [16, 32, 48],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };

    /** @ngInject */
    constructor(private $scope: angular.IScope,
    // private $element: JQLite,
    private $location: angular.ILocationService,
    private backendSrv: BackendSrv,) { }// Dependency Injection

    $onInit(): void {

        this.asyncUpdateTypeList();
        this.asyncUpdateList().then(() => {
            this.initMqtt();
        });

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
        const topics = topic.split("/");
        const flowId = topics[topics.length - 2];

        for (const item of this.list) {
            if (item.params.FlowId === flowId) {
                item.color = payload;
                this.$scope.$applyAsync();
            }
        }
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
        this.$scope.$watch("list", () => {
            this.setPageNodes();
        });
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
            this.setPageNodes();
            this.$scope.$applyAsync();
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
                this.setPageNodes();
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
                    // 싱크 문제 해결이 필요
                    this.publishMqtt(`${baseTopic}/status`, '');
                    this.publishMqtt(`${baseTopic}/data`, '');

                    list.splice(parseInt(index, 10), 1);
                    break;
                }
            }
            this.setPageNodes();
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    // table methods
    setPageNodes() {
        const { currPage, rowCount, } = this.tData;
        if (this.list) {
            this.tData.pageNode = this.list.slice(
                currPage * rowCount,
                (currPage * rowCount) + rowCount
            );
        }
    }

    tNextPaging(): void {
        if (this.tData.currPage < this.tData.maxPage) {
            this.tData.currPage += 1;
            this.setPageNodes();
        }
    }

    tPrevPaging(): void {
        if (this.tData.currPage) {
            this.tData.currPage -= 1;
            this.setPageNodes();
        }
    }

    tSetPaging(index: number) {
        this.tData.currPage = index;
        this.tCalcPaging();
        this.setPageNodes();
    }

    tCalcPaging() {
        const { rowCount } = this.tData;
        const temp: number = (this.list.length && (this.list.length % rowCount) === 0) ? 1 : 0;
        this.tData.maxPage = Math.floor(this.list.length / (rowCount)) - temp;
    }

    tGetPagingNumberArray() {
        const { currPage, maxPageLen, maxPage } = this.tData;
        const index = Math.floor(currPage / maxPageLen);

        const from = index * maxPageLen;
        let to = index * maxPageLen + maxPageLen;
        if (to > maxPage) {
            to = maxPage + 1;
        }

        return _.range(from, to);
    }
    // table event methods
    tOnSelectChange() {
        this.tCalcPaging();
        this.setPageNodes();
    }
}
