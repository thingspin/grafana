import _ from 'lodash';
import angular from 'angular';
const uid = require('shortid');

import { TsConnect } from 'app-thingspin-fms/models/connect';
import { BackendSrv } from 'app/core/services/backend_srv';

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

export interface Banner {
    title: string;
}

export interface TableModel {
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
    readonly pageBathPath = '/thingspin/manage/data/connect';

    // MQTT
    readonly mqttUrl = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt`;
    readonly listenerTopic = '/thingspin/+/+/status';
    mqttClient: TsMqttController; // mqtt client instance

    // UI Data
    runConnection: number;
    runNodes: number;
    totalConnection: number;
    totalNodes: number;

    license: any;
    // banner
    banner: Banner = {
        title: '산업용 프로토콜 및 기타 데이터소스에 대한 연결',
    };
    connectTypeList: string[] = [];
    // table
    list: TsConnect[] = [];
    tData: TableModel = {
        rowCount: 16,
        selectOpts: [16, 32, 48],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };

    /** @ngInject */
    constructor(private $scope: angular.IScope,
        private $location: angular.ILocationService,
        private backendSrv: BackendSrv, ) { }// Dependency Injection

    $onInit(): void {
        this.asyncUpdateTypeList();
        this.asyncUpdateList().then(() => {
            this.initMqtt();
        });
        this.initTable();
        this.getSetting();
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
            console.log('MQTT Connected');
        } catch (e) {
            console.error(e);
        }
    }

    recvMqttMessage(topic: string, payload: string | object): void {
        const topics = topic.split('/');
        const id = topics[topics.length - 2];
        const target = topics[topics.length - 3];
        let isChange = false;

        switch (target) {
            case 'connect':
                this.list.filter(({ params }) => (params.FlowId === id))
                    .forEach((item) => {
                        item.color = payload;
                        item.status['old'] = payload;
                        isChange = true;
                    });
                break;
            default:
                const num = parseInt(id, 10);
                this.list.filter(({ id }) => (id === num))
                    .forEach((item) => {
                        item.status = payload;
                        isChange = true;
                    });
        }

        if (isChange) {
            this.$scope.$applyAsync();
        }
    }

    publishMqtt(topic: string, message: string): Error {
        if (!this.mqttClient) {
            const errMsg = 'MQTT Client is not generated';
            console.error(errMsg);

            return new Error(errMsg);
        }

        return this.mqttClient.publish(topic, message);
    }

    initTable(): void {
        this.$scope.$watch('list', () => {
            this.setPageNodes();
        });
    }
    showEdit(type: string, id: number): void {
        this.$location.path(`${this.pageBathPath}/${type}/${id}`);
    }

    changePage(type: string): void {
        this.$location.path(`${this.pageBathPath}/${type}`);
    }

    getSetting() {
        this.backendSrv.get("api/frontend/settings").then((result: any) => {
            this.totalConnection = Number(result.companions.license.Connect);
            this.totalNodes = Number(result.companions.license.Nodes);
        });
    }

    enablePublish({ id, enable }: TsConnect) {
        this.asyncRun(id, enable);
    }

    async updatePublish(item: TsConnect) {
        if (!confirm(`데이터 동시 발행을 ${item.publish ? '' : '정지'}하겠습니까?`)) {
            item.publish = !item.publish;
            this.$scope.$applyAsync();
            return;
        }

        try {
            await this.backendSrv.patch(`thingspin/connect/${item.id}/publish`, item);
        } catch (e) {
            item.publish = !item.publish;
        }

        this.$scope.$applyAsync();
    }

    async asyncRun(id: number, enable: boolean): Promise<void> {
        if (!confirm(`데이터 수집을 ${enable ? '시작' : '중지'}하시겠습니까?`)) {
            return;
        }

        const index: number = this.list.findIndex((value) => (value.id === id));
        try {
            const flowId = uid.generate();
            await this.backendSrv.patch(`thingspin/connect/${id}/enable`, {
                flowId,
                enable,
            });
            const list = this.list[index];

            list.enable = enable;
            list.params.FlowId = flowId;
            this.setPageNodes();
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async asyncUpdateTypeList(): Promise<void> {
        try {
            this.connectTypeList = await this.backendSrv.get('thingspin/type/connect');
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async asyncUpdateList(): Promise<void> {
        try {
            const list: TsConnect[] = await this.backendSrv.get('thingspin/connect');
            if (list) {
                this.list = list.map((item) => ({ ...item, status: {} }));

                this.$scope.$applyAsync();
                this.setPageNodes();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async asyncRemoveConnect(id: number): Promise<void> {
        if (!confirm('정말로 삭제하시겠습니까?')) {
            return;
        }

        try {
            await this.backendSrv.delete(`thingspin/connect/${id}`);
            // publish mqtt data
            const { list } = this;

            const index = list.findIndex((item) => item.id === id);
            if (index >= 0) {
                const baseTopic = `/thingspin/connect/${list[index].params.FlowId}`;
                // 싱크 문제 해결이 필요
                this.publishMqtt(`${baseTopic}/status`, '');
                this.publishMqtt(`${baseTopic}/data`, '');

                list.splice(index, 1);
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

            this.setCountValue();
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

    setCountValue() {
        if (this.list && this.list.length) {
            this.runConnection = 0;
            this.runNodes = 0;

            for (const { enable, params: { PtagList }, } of this.list) {
                if ( enable && PtagList) {
                    this.runNodes += PtagList.length;
                    this.runConnection += 1;
                }
            }
        }
    }
}
