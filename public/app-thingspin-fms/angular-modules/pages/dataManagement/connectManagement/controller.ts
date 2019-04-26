 import angular from "angular";

import { TsConnect, GroupTsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
    readonly listenerTopic: string = "/thingspin/connect/#" as string;
    mqttClient: TsMqttController; // mqtt client instance

    connectMenuOpen: boolean = false as boolean;
    connectTypeList: string[];
    groupList: GroupTsConnect;

    /** @ngInject */
    constructor(private $scope: angular.IScope, private $location: angular.ILocationService,
    private backendSrv: BackendSrv,) { }// Dependency Injection

    $onInit(): void {
        this.asyncUpdateTypeList();
        this.asyncUpdateList();

        this.initMqtt();
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
            const message: string = "MQTT Client is not generated" as string;
            console.error(message);

            return new Error(message);
        }

        return this.mqttClient.publish(topic, message);
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
                this.groupList = this.genGroupList(list);
                this.$scope.$applyAsync();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async asyncRemoveConnect(type: string, id: number): Promise<void> {
        try {
            await this.backendSrv.delete(`thingspin/connect/${id}`);
            // publish mqtt data
            const list: TsConnect[] = this.groupList[type];
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
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    async asyncToggleConnect(type: string, id: number): Promise<void> {
        try {
            await this.backendSrv.patch(`thingspin/connect/${id}`, {});
            const list: TsConnect[] = this.groupList[type];
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
        history.pushState({data: `/${type}`,}, "", `/thingspin/manage/data/connect/${type}`);
    }
}
