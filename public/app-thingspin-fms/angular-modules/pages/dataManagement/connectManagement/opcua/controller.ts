const uid = require("shortid");

import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/core';

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

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
    securityMode: string ;
    auth: string;
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

    /** @ngInject */
    constructor(
        private $routeParams: any,
        private $scope: angular.IScope,
        private $location: angular.ILocationService,
        private backendSrv: BackendSrv) { }

    $onInit(): void {
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
            };
        }
    }

    async updateData(connId: number) {
        try {
            this.connId = connId;
            const result: OpcConnectModel = await this.backendSrv.get(`${baseApi}/${this.connId}`);

            this.input = {
                endpointUrl: result.params.EndpointUrl,
                name: result.name,
                auth: result.params.auth,
                securityMode: result.params.securityMode,
                securityPolicy: result.params.securityPolicy,
            };
            this.FlowId = result.params.FlowId;
            this.nodes = result.params.nodes;
            this.enableNodeSet = true;

            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
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
        const { name, endpointUrl, auth, securityPolicy, securityMode } = this.input;
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
            intervals: 1,
        };
    }

    async addConnect() {
        this.FlowId = uid.generate();
        this.setConnectStatus("yellow");

        this.timer = setTimeout(() => {
            this.setConnectStatus("red");
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

    setConnectStatus(color: string): void {
        this.connectStatus = color;
        if (color === "green") {
            this.enableNodeSet = true;
        }

        this.$scope.$applyAsync();
    }

    cancel(): void {
        this.$location.path("/thingspin/manage/data/connect");
    }

    async save(): Promise<void> {
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

            appEvents.emit('alert-success', ['신규 OPC/UA 연결이 추가되었습니다.']);
        } else {
            await this.backendSrv.put(`${baseApi}/${this.connId}`, payload);

            appEvents.emit('alert-success', ['OPC/UA 연결이 수정되었습니다.']);
            connId = this.connId;
        }
        return connId;
    }
}
