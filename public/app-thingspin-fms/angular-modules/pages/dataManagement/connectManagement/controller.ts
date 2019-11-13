// js 3rd party libs
import _ from 'lodash';
import angular from 'angular';
const uid = require('shortid');

// Grafana libs
import { CoreEvents } from 'app/types';
import { AppEvents, dateTime } from '@grafana/data';
import appEvents from 'app/core/app_events';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import TsMqttController from 'app-thingspin-fms/utils/mqttController';
import { TsConnect, TsConnectHistory } from 'app-thingspin-fms/models/connect';

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

export function generateModalData(
    // Required params
    src: string,
    title: string,
    list: TsConnectHistory[],
    // not Required params(has default value)
    topic?: string,
    icon = 'fa fa-history',
    backdrop = 'static',
) {
    // table Data's
    const tData: TableModel = {
        rowCount: 5,
        selectOpts: [5, 10, 20, 50, 100],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };

    // table common methods
    function setHistoryPageNodes() {
        const { currPage, rowCount, } = tData;
        if (list) {
            tData.pageNode = list.slice(
                currPage * rowCount,
                (currPage * rowCount) + rowCount
            );
        }
    }

    function tHistoryCalcPaging() {
        const { rowCount } = tData;
        const temp: number = (list.length && (list.length % rowCount) === 0) ? 1 : 0;
        tData.maxPage = Math.floor(list.length / (rowCount)) - temp;
    }

    function tOnHistorySelectChange() {
        tData.currPage = 0;
        tHistoryCalcPaging();
        setHistoryPageNodes();
    }

    tOnHistorySelectChange();

    return {
        src,
        backdrop,
        model: {
            // Datas
            title, icon, tData, list, topic,
            // methods
            tOnHistorySelectChange,
            tHistoryPrevPaging: (): void => {
                if (tData.currPage) {
                    tData.currPage -= 1;
                    setHistoryPageNodes();
                }
            },
            tGetHistoryPagingNumberArray: () => {
                const { currPage, maxPageLen, maxPage } = tData;
                const index = Math.floor(currPage / maxPageLen);

                const from = index * maxPageLen;
                let to = index * maxPageLen + maxPageLen;
                if (to > maxPage) {
                    to = maxPage + 1;
                }

                return _.range(from, to);
            },
            tHistoryNextPaging: (): void => {
                if (tData.currPage < tData.maxPage) {
                    tData.currPage += 1;
                    setHistoryPageNodes();
                }
            },
            tSetHistoryPaging: (index: number) => {
                tData.currPage = index;
                tHistoryCalcPaging();
                setHistoryPageNodes();
            },
            publishMqttClipeboard: () => {
                $('#topic_view').select();
                document.execCommand("copy");
                appEvents.emit(AppEvents.alertSuccess, ["클립보드에 복사하였습니다."]);
            },
        },
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
    runConnection = 0;
    runNodes = 0;
    totalConnection: number;
    totalNodes: number;

    connectTypeList: string[] = [];
    // table
    list: TsConnect[] = [];
    tData: TableModel = {
        rowCount: 5,
        selectOpts: [5, 10, 20, 50, 100],
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
            await this.mqttClient.run(this.recvMqttMessage);
            console.log('MQTT Connected');
        } catch (e) {
            console.error(e);
        }
    }

    recvMqttMessage = (topic: string, payload: string | object): void => {
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
                const pl = payload as MqttContent;
                const num = parseInt(id, 10);
                this.list.filter(({ id }) => (id === num)).forEach((item) => {
                    item.status = pl;
                    if (pl && pl.connect) {
                        item.color = pl.connect.fill;
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
    }

    showEdit(type: string, id: number): void {
        this.$location.path(`${this.pageBathPath}/${type}/${id}`);
    }

    changePage(type: string): void {
        this.$location.path(`${this.pageBathPath}/${type}`);
    }

    async getSetting() {
        const { companions: { license: { Connect, Nodes } } } = await this.backendSrv.get("api/frontend/settings");
        this.totalConnection = Number(Connect);
        this.totalNodes = Number(Nodes);
        this.$scope.$applyAsync();
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
        const index = this.list.findIndex((item) => id === item.id);

        this.modalPopupRunning(id, enable);
        const list = this.list[index];
        list.enable = !enable;
    }

    modalPopupPublish(item: TsConnect) {
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
            title: '데이터 발행',
            text2: `${item.name} 데이터 발행을 ${detailMiddle} 하시겠습니까?`,
            icon: icon,
            yesText: successBtn,
            noText: "취소",
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

        const item = this.list[index];
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
            title: '데이터 수집',
            text2: `${ item.name } 데이터 수집을 ${ detailMiddle } 하시겠습니까?`,
            icon: icon,
            yesText: successBtn,
            noText: "취소",
            onConfirm: async () => {
                try {
                    const flowId = uid.generate();
                    await this.backendSrv.patch(`thingspin/connect/${id}/enable`, {
                        flowId,
                        enable,
                    });

                    item.enable = enable;
                    item.params.FlowId = flowId;
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
                this.tCalcPaging();
                this.setPageNodes();
            }
        } catch (e) {
            console.error(e);
        }
    }

    convHistoryField(history: TsConnectHistory) {
        history.created = dateTime(history.created).utc().format('YYYY-MM-DD HH:mm:ss');
        return history;
    }

    async totalHistoryShow() {
        try {
            const historyList = (await this.backendSrv.get(`thingspin/connect/history`) || [])
                .map(this.convHistoryField);

            const modalPayoad = generateModalData('public/app/partials/ts_connect_total_history.html',
                '전체 연결 이력 관리',
                historyList);
            appEvents.emit(CoreEvents.showModal, modalPayoad);
        } catch (e) {
            console.error(e);
        }
    }

    async showModalHistory({ id, name, type }: TsConnect) {
        try {
            const historyList = (await this.backendSrv.get(`thingspin/connect/${id}/history`) || [])
                .map(this.convHistoryField);

            const modalPayload = generateModalData('public/app/partials/ts_connect_history.html',
                `${name} 연결 이력 관리`,
                historyList,
                `thingspin/${type}/${id}/data`);
            appEvents.emit(CoreEvents.showModal, modalPayload);
        } catch (e) {
            console.error(e);
        }
    }

    removeConnect(id: number) {
        const { list } = this;
        const index = list.findIndex((item) => item.id === id);
        const { name, params, type } = this.list[index];

        appEvents.emit(CoreEvents.showConfirmModal, {
            title: '연결 삭제',
            text2: name + ' 연결 정보를 삭제하시겠습니까?',
            icon: 'fa-trash',
            yesText: '삭제',
            noText: '취소',
            onConfirm: async () => {
                try {
                    await this.backendSrv.delete(`thingspin/connect/${id}`);
                    // publish mqtt data

                    if (index >= 0) {
                        const baseTopic = `/thingspin/connect/${params.FlowId}`;
                        const sideTopic = `/thingspin/${type}/${id}`;
                        const orderTopic = `/thingspin/${type}/<no value>`;
                        const topics = [
                            `${baseTopic}/status`, `${baseTopic}/data`,
                            `${sideTopic}/status`, `${sideTopic}/data`,
                            `${orderTopic}/status`,`${orderTopic}/data`,
                        ];
                        // 싱크 문제 해결이 필요
                        for (const topic of topics) {
                            this.publishMqtt(topic, '');
                        }
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
        }
        this.setCountValue();
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
        // this.tCalcPaging();
        // this.setPageNodes();
        this.tSetPaging(0);
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
}
