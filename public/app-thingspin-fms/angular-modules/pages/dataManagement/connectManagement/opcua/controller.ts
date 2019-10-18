// js 3rd party libs
const uid = require("shortid");

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
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

export function formatDate(date: Date): string {
    return dateTime(date).format('YYYY-MM-DD_HH:mm:ss');
}

export default class TsOpcUaConnectCtrl implements angular.IController {
    // 2-way binding child directive data
    input: InputModel;
    connectStatus: string;

    // MQTT
    readonly mqttUrl = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt`;
    readonly listenerTopic = `${baseApi}/+/status`;
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
    nodes: any[];
    timer: NodeJS.Timer | null;
    enableNodeSet: boolean;
    closeValue: boolean;

    /** @ngInject */
    constructor(
        private $routeParams: any,
        private $scope: angular.IScope,
        private $location: angular.ILocationService,
        private backendSrv: BackendSrv) { }

    $onInit(): void {
        this.closeValue = false;
        this.initMqtt();
        const { id } = this.$routeParams;
        if (id) {
            this.updateData(id);
        } else {
            this.nodes = [];
            this.input = {
                auth: "Anonymous",
                securityMode: "None",
                securityPolicy: "None",
                endpointUrl: "http://localhost:4843/",
                name: '',
                intervals: 1,
            };
        }
    }

    inputChecker(): boolean {
        if (this.input !== undefined) {
            if (this.input.name.length === 0) {
                appEvents.emit(AppEvents.alertWarning, ['수집기 이름을 설정 하세요.']);
                return false;
            }
            if (this.input.endpointUrl.length === 0) {
                appEvents.emit(AppEvents.alertWarning, ['Endpoint URL을 입력 하세요.']);
                return false;
            } else if (this.input.endpointUrl.length > 0) {
                if (this.input.endpointUrl.indexOf("://") === -1) {
                    appEvents.emit(AppEvents.alertWarning, ['Endpoint URL 형태가 잘못되었습니다.\n다시 입력해주세요.']);
                    return false;
                }
            }
        }
        return true;
    }

    async updateData(connId: number) {
        if (this.inputChecker()) {
            try {
                this.connId = connId;
                const result: OpcConnectModel = await this.backendSrv.get(`${baseApi}/${this.connId}`);

                this.input = {
                    endpointUrl: result.params.EndpointUrl,
                    name: result.name,
                    auth: result.params.auth,
                    securityMode: result.params.securityMode,
                    securityPolicy: result.params.securityPolicy,
                    intervals: result.intervals,
                };
                this.FlowId = result.params.FlowId;
                this.nodes = result.params.nodes;
                this.enableNodeSet = true;

                this.$scope.$applyAsync();
            } catch (e) {
                console.error(e);
            }
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

    recvMqttMessage(topic: string, payload: string): void {
        const topics = topic.split("/");
        const flowId = topics[topics.length - 2];

        if (flowId === this.FlowId) {
            clearTimeout(this.timer);
            this.setConnectStatus(payload);
        }
    }

    genPayload(FlowId: string): BackendConnectPayload {
        const { nodes } = this;
        const { name, endpointUrl, auth, securityPolicy, securityMode, intervals } = this.input;
        const PtagList = Array.from(nodes, ({ displayName }) => ({
            name: displayName.text,
            type: ""
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
        this.FlowId = uid.generate();
        this.setConnectStatus("yellow");
        this.timer = setTimeout(() => {
            this.setConnectStatus("red");
        }, this.connectTimeout);

        if (this.inputChecker()) {
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

    setConnectStatus(color: string): void {
        this.connectStatus = color;
        if (color === "green") {
            this.enableNodeSet = true;
        }

        this.$scope.$applyAsync();
    }

    jsonDataParsingChecker({ intervals, name, params }: any) {
        return !(!intervals || !name || !params);
    }

    onUpload(dash: any) {
        this.jsonDataParsingChecker(dash);
        this.input = {
            endpointUrl: dash.params.EndpointUrl,
            name: dash.name,
            auth: dash.params.auth,
            securityMode: dash.params.securityMode,
            securityPolicy: dash.params.securityPolicy,
            intervals: dash.intervals,
        };
        this.nodes = dash.params.nodes;
        this.enableNodeSet = true;
    }

    exportData(): void {
        if (this.inputChecker()) {
            const payload = this.genPayload(this.FlowId);

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
            $("#downloadAnchorElem").attr("href", dataStr);
            $("#downloadAnchorElem").attr("download", payload.name + "_" + formatDate(new Date()) + ".json");
            $("#downloadAnchorElem").get(0).click();
        }
    }

    cancel(): void {
        this.$location.path("/thingspin/manage/data/connect");
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
            this.closeValue = true;
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
