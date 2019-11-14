// js 3rd party libs
const uid = require('shortid');

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { CoreEvents } from 'app/types';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import TsMqttController from 'app-thingspin-fms/utils/mqttController';

import { dateTime } from '@grafana/data';

const baseApi = `/thingspin/connect`;
export interface BackendConnectPayload {
    name: string;
    params: any;
    intervals: number;
}

export interface InputModel {
    endpointUrl: string;
    name: string;
    securityPolicy: string;
    securityMode: string;
    auth: string;
    intervals?: number;
}

export interface OpcConnectModel {
    active: boolean;
    created: string;
    enable: boolean;
    flow_id: string;
    id: number;
    intervals: number;
    name: string;
    params: {
        EndpointUrl: string;
        FlowId: string;
        nodes: any[];
        auth: string;
        securityPolicy: string;
        securityMode: string;
    };
    updated: string;
}

export interface NodeRedStatusPayload {
    fill: string;
    shape: string;
    text: string;
    source: NodeRedSource;
}

export interface NodeRedSource {
    id: string;
    type: string;
    name: string;
}

export interface ReceivedMQTTPayload {
    id: string;
    MQTT: NodeRedStatusPayload;
    connect: NodeRedStatusPayload;
}

export default class TsOpcUaConnectCtrl implements angular.IController {
    // 2-way binding child directive data
    input: InputModel = {
        auth: 'Anonymous',
        securityMode: 'None',
        securityPolicy: 'None',
        endpointUrl: 'http://localhost:4843/',
        name: '',
        intervals: 1,
    };

    _connectStatus: string;
    set connectStatus(color: string) {
        this._connectStatus = color;
        if (color === 'green') {
            this.enableNodeSet = true;
        }

        this.$scope.$applyAsync();
    }
    get connectStatus() {
        return this._connectStatus;
    }

    // MQTT
    readonly mqttUrl = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt`;
    readonly connectTimeout: number = 15000;
    mqttClient: TsMqttController; // mqtt client instance

    // UI data
    readonly errorComment: string[] = [
        `OPC/UA 서버가 동작 중이지 않을 수 있습니다.`,
        `ThingSPIN에서 OPC/UA 서버에 접근 할 수 있는 환경이 아닐 수 있습니다.`,
        `네트워크 상태에 따라 서버에 연겨이 지연 될 수 있습니다.`,
        `자세한 사항은 OPC/UA서버 관리자에 문의 바랍니다.`,
    ];
    connId: number = null;
    FlowId: string;
    nodes: any[] = [];
    timer: NodeJS.Timer | null;
    enableNodeSet = false;
    closeValue = false;

    /** @ngInject */
    constructor(
        private $routeParams: any,
        private $scope: angular.IScope,
        private $location: angular.ILocationService,
        private backendSrv: BackendSrv) { }

    async $onInit() {
        const { id } = this.$routeParams;
        if (id) {
            await this.updateData(parseInt(id, 10));
        }
        this.initMqtt();
    }

    $onDestroy(): void {
        if (this.mqttClient) {
            this.mqttClient.end();
        }
    }

    inputChecker(): boolean {
        const { name, endpointUrl } = this.input;
        const errMsg = (!name) ? '수집기 이름을 설정 하세요.'
            : !endpointUrl ? 'Endpoint URL을 입력 하세요.'
                : endpointUrl.indexOf('://') === -1 ? 'Endpoint URL 형태가 잘못되었습니다.\n다시 입력해주세요.'
                    : '';

        if (errMsg) {
            appEvents.emit(AppEvents.alertWarning, [errMsg]);
        }
        return !errMsg;
    }

    async updateData(connId: number) {
        try {
            this.connId = connId;
            const { params, name, intervals }: OpcConnectModel = await this.backendSrv.get(`${baseApi}/${this.connId}`);
            const { EndpointUrl, auth, securityMode, securityPolicy, FlowId, nodes } = params;

            this.input = {
                endpointUrl: EndpointUrl,
                name,
                auth,
                securityMode,
                securityPolicy,
                intervals,
            };
            this.FlowId = FlowId;
            this.nodes = nodes;
            this.enableNodeSet = true;

            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async initMqtt(): Promise<void> {
        this.mqttClient = new TsMqttController(this.mqttUrl, `/thingspin/opcua/+/status`);

        try {
            await this.mqttClient.run(this.recvMqttMessage);
            console.log('MQTT Connected');
        } catch (e) {
            console.error(e);
        }
    }

    recvMqttMessage = (topic: string, payload: ReceivedMQTTPayload): void =>  {
        const topics = topic.split('/');
        const connId = parseInt(topics[topics.length - 2], 10);

        if (connId === this.connId) {
            clearTimeout(this.timer);
            this.connectStatus = payload.connect.fill;
        }
    }

    genPayload(FlowId: string): BackendConnectPayload {
        const { nodes } = this;
        const { name, endpointUrl, auth, securityPolicy, securityMode, intervals } = this.input;
        const PtagList = nodes.map(({ displayName }) => ({
            name: displayName.text,
            type: ''
        }));

        return {
            name,
            params: {
                FlowId,
                EndpointUrl: endpointUrl,
                AddressSpaceItems: [],
                nodes,
                auth,
                securityPolicy,
                securityMode,
                PtagList,
            },
            intervals,
        };
    }

    async addConnect() {
        if (this.inputChecker()) {
            this.FlowId = uid.generate();
            this.connectStatus = 'yellow';
            this.timer = setTimeout(() => {
                this.connectStatus = 'red';
            }, this.connectTimeout);

            try {
                const connId = await this.sendBackend(!this.connId);
                this.connId = connId;
            } catch (e) {
                console.error(e);
                if (this.connId) {
                    this.FlowId = null;
                }
            }
        }
    }

    jsonDataParsingChecker({ intervals, name, params }: any) {
        return !(!intervals || !name || !params);
    }

    onUpload(dash: any) {
        this.jsonDataParsingChecker(dash);
        appEvents.emit(CoreEvents.showConfirmModal, {
            title: 'Import 방식',
            text2: `Import 된 내용을 Overwrite 하시겠습니까?`,
            icon: 'fa-trash',
            yesText: "Overwrite",
            altActionText: 'Add on',
            onAltAction: async () => {
                try {
                this.nodes = this.nodes.concat(dash.params.nodes);
                } catch (e) {
                    console.error(e);
                }
            },
            onConfirm: async () => {
                try {
                    this.input = {
                        endpointUrl: dash.params.EndpointUrl,
                        name: dash.name,
                        auth: dash.params.auth,
                        securityMode: dash.params.securityMode,
                        securityPolicy: dash.params.securityPolicy,
                        intervals: dash.intervals,
                    };
                    this.nodes = [];
                    this.nodes = dash.params.nodes;
                    this.enableNodeSet = true;
                } catch (e) {
                    console.error(e);
                }
            },
        });
    }

    exportData(): void {
        if (this.inputChecker()) {
            const payload = this.genPayload(this.FlowId);
            const $elem = $('#downloadAnchorElem');
            const d = dateTime(new Date()).format('YYYY-MM-DD_HH:mm:ss');

            $elem.attr('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload)))
                .attr('download', `${payload.name}_${d}.json`)
                .get(0).click();
        }
    }

    cancel(): void {
        this.$location.path('/thingspin/manage/data/connect');
    }

    async save(): Promise<void> {
        if (this.inputChecker()) {
            if (!this.FlowId) {
                this.FlowId = uid.generate();
            }

            try {
                const connId = await this.sendBackend(!this.connId);
                this.connId = connId;

                this.cancel();
                this.$scope.$applyAsync();
            } catch (e) {
                console.error(e);
            }
        }
    }

    timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async sendBackend(isNew: boolean): Promise<any> {
        const payload = this.genPayload(this.FlowId);

        let connId;
        if (isNew) {
            // new
            connId = await this.backendSrv.post(`${baseApi}/opcua`, payload);
            await this.timeout(3000);
            await this.backendSrv.put(`${baseApi}/${connId}`, payload);

            appEvents.emit(AppEvents.alertSuccess, ['신규 OPC/UA 연결이 추가되었습니다.']);
        } else {
            await this.backendSrv.put(`${baseApi}/${this.connId}`, payload);
            appEvents.emit(AppEvents.alertSuccess, ['OPC/UA 연결이 수정되었습니다.']);
            connId = this.connId;
        }
        return connId;
    }
}
