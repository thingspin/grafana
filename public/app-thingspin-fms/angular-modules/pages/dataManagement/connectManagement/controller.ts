// js 3rd party libs
import _ from 'lodash';
import angular from 'angular';
const uid = require('shortid');

// Grafana libs
import { CoreEvents } from 'app/types';
import { AppEvents } from '@grafana/data';
import appEvents from 'app/core/app_events';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import TsMqttController from 'app-thingspin-fms/utils/mqttController';
import { TsConnect, TsConnectHistory } from 'app-thingspin-fms/models/connect';

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

export interface MqttContent {
    id: string;
    old: string;
    connect: {
        fill: string;
    };
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
    historyList: TsConnectHistory[] = [];
    tData: TableModel = {
        rowCount: 16,
        selectOpts: [16, 32, 48],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };

    tHistoryData: TableModel = {
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
        this.runConnection = 0;
        this.runNodes = 0;
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
                        if ((payload as MqttContent)) {
                            if ((payload as MqttContent).connect) {
                                item.color = (payload as MqttContent).connect.fill;
                            }
                        }
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

        this.$scope.$watch('historyList', () => {
            this.setHistoryPageNodes();
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
        this.run(id, enable);
    }

    updatePublish(item: TsConnect) {
        this.modalPopupPublish(item);
        item.publish = !item.publish;
        this.$scope.$applyAsync();
    }

    run(id: number, enable: boolean) {
        const index: number = this.list.findIndex((item) => id === item.id);

        this.modalPopupRunning(id, enable);
        const list = this.list[index];
        list.enable = !enable;
    }

    modalPopupPublish(item: TsConnect) {
        const mainTitle = "데이터 발행",
            detailFirst = " 데이터 발행을 ",
            detailLast = " 하시겠습니까?",
            cancelBtn = "취소";

        let detailMiddle, successBtn, icon;
        if (item.publish) {
            detailMiddle = "시작";
            successBtn = "발행 시작";
            icon = "tsi icon-ts-play_circle_filled";
        } else {
            detailMiddle = "종료";
            successBtn = "발행 종료";
            icon = "tsi icon-ts-pause_circle_filled";
        }

        appEvents.emit(CoreEvents.showConfirmModal, {
            title: mainTitle,
            text2: item.name + detailFirst + detailMiddle + detailLast,
            icon: icon,
            yesText: successBtn,
            noText: cancelBtn,
            onConfirm: async () => {
                try {
                    item.publish = !item.publish;
                    await this.backendSrv.patch(`thingspin/connect/${item.id}/publish`, item);
                } catch (e) {
                    item.publish = !item.publish;
                    console.error(e);
                }
            },
        });
    }

    modalPopupRunning(id: number, enable: boolean) {
        const index: number = this.list.findIndex((item) => id === item.id);
        if (index < 0) {
            return;
        }

        const mainTitle = "데이터 수집",
            detailFirst = " 데이터 수집을 ",
            detailLast = " 하시겠습니까?",
            cancelBtn = "취소";

        let detailMiddle, successBtn, icon;
        if (enable) {
            detailMiddle = "시작";
            successBtn = "수집 시작";
            icon = "tsi icon-ts-play_circle_filled";
        } else {
            detailMiddle = "종료";
            successBtn = "수집 종료";
            icon = "tsi icon-ts-pause_circle_filled";
        }

        appEvents.emit(CoreEvents.showConfirmModal, {
            title: mainTitle,
            text2: this.list[index].name + detailFirst + detailMiddle + detailLast,
            icon: icon,
            yesText: successBtn,
            noText: cancelBtn,
            onConfirm: async () => {
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
        });
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

    resultDateToShowString(value: string) {
        const slice = value.replace('T', ' ');
        return slice.substring(0,19);
    }

    async showModalHistory(item: TsConnect) {
        try {
            this.historyList = await this.backendSrv.get(`thingspin/connect/${item.id}/history`);

            this.historyList.forEach(element => {
                element.created = this.resultDateToShowString(element.created);
            });

            appEvents.emit(CoreEvents.showModal, {
                src: 'public/app/partials/ts_connect_history.html',
                backdrop: 'static',
                model: {
                    title: item.name + ' 연결 이력 관리',
                    topic: "thingspin/" + item.type + "/" + item.id + "/data",
                    icon: 'fa fa-history',
                    tData: this.tHistoryData,
                    list: this.historyList,

                    tOnHistorySelectChange: () => {
                        this.tOnHistorySelectChange();
                    },

                    tHistoryPrevPaging: () => {
                        this.tHistoryPrevPaging();
                    },

                    tGetHistoryPagingNumberArray: () => {
                        return this.tGetHistoryPagingNumberArray();
                    },

                    tHistoryNextPaging: () => {
                        this.tHistoryNextPaging();
                    },

                    tSetHistoryPaging: (page: number) => {
                        this.tSetHistoryPaging(page);
                    },

                    publishMqttClipeboard: () => {
                        this.publishMqttClipeboard();
                    }
                }
            });
            this.tOnHistorySelectChange();
        } catch (e) {
            console.error(e);
        }
    }

    removeConnect(id: number) {
        const index = this.list.findIndex((item) => item.id === id);

        appEvents.emit(CoreEvents.showConfirmModal, {
            title: '연결 삭제',
            text2: this.list[index].name + ' 연결 정보를 삭제하시겠습니까?',
            icon: 'fa-trash',
            yesText: '삭제',
            noText: '취소',
            onConfirm: async () => {
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
                        const sideTopic = `/thingspin/${list[index].type}/${list[index].id}`;
                        this.publishMqtt(`${sideTopic}/status`, '');
                        this.publishMqtt(`${sideTopic}/data`, '');
                        const orderTopic = `/thingspin/${list[index].type}/<no value>`;
                        this.publishMqtt(`${orderTopic}/status`, '');
                        this.publishMqtt(`${orderTopic}/data`, '');

                        list.splice(index, 1);
                    }

                    this.setPageNodes();
                    this.$scope.$applyAsync();
                } catch (e) {
                    console.error(e);
                }
            },
        });
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
    // table methods
    setHistoryPageNodes() {
        const { currPage, rowCount, } = this.tHistoryData;
        if (this.historyList) {
            this.tHistoryData.pageNode = this.historyList.slice(
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

    tHistoryNextPaging(): void {
        if (this.tHistoryData.currPage < this.tHistoryData.maxPage) {
            this.tHistoryData.currPage += 1;
            this.setHistoryPageNodes();
        }
    }

    tPrevPaging(): void {
        if (this.tData.currPage) {
            this.tData.currPage -= 1;
            this.setPageNodes();
        }
    }

    tHistoryPrevPaging(): void {
        if (this.tHistoryData.currPage) {
            this.tHistoryData.currPage -= 1;
            this.setHistoryPageNodes();
        }
    }

    tSetPaging(index: number) {
        this.tData.currPage = index;
        this.tCalcPaging();
        this.setPageNodes();
    }

    tSetHistoryPaging(index: number) {
        this.tHistoryData.currPage = index;
        this.tHistoryCalcPaging();
        this.setHistoryPageNodes();
    }

    tCalcPaging() {
        const { rowCount } = this.tData;
        const temp: number = (this.list.length && (this.list.length % rowCount) === 0) ? 1 : 0;
        this.tData.maxPage = Math.floor(this.list.length / (rowCount)) - temp;
    }

    tHistoryCalcPaging() {
        const { rowCount } = this.tHistoryData;
        const temp: number = (this.historyList.length && (this.historyList.length % rowCount) === 0) ? 1 : 0;
        this.tHistoryData.maxPage = Math.floor(this.historyList.length / (rowCount)) - temp;
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

    tGetHistoryPagingNumberArray() {
        const { currPage, maxPageLen, maxPage } = this.tHistoryData;
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

    tOnHistorySelectChange() {
        this.tHistoryCalcPaging();
        this.setHistoryPageNodes();
    }

    setCountValue() {
        if (this.list && this.list.length) {
            this.runConnection = 0;
            this.runNodes = 0;

            for (const { enable, params: { PtagList }, } of this.list) {
                if (enable && PtagList) {
                    this.runNodes += PtagList.length;
                    this.runConnection += 1;
                }
            }
        }
    }

    publishMqttClipeboard() {
        $('#topic_view').select();
        document.execCommand("copy");
        appEvents.emit(AppEvents.alertSuccess, ["클립보드에 복사하였습니다."]);
    }
}
