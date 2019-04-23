import angular from "angular";

import mqtt from "mqtt";

import { TsConnect, GroupTsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';

// AngularJs Lifecycle hook (https://docs.angularjs.org/guide/component)
export default class TsConnectManagementCtrl implements angular.IController {
    mqttClient: mqtt.Client;
    connectMenuOpen: boolean;
    connectTypeList: string[];
    groupList: GroupTsConnect;
    mqttPubOpts: mqtt.IClientPublishOptions = {
        retain: true,
        qos: 0,
        dup: false,
    };

    /** @ngInject */
    constructor(private $scope: angular.IScope, private $location: angular.ILocationService,
    private backendSrv: BackendSrv,) { }// Dependency Injection

    $onInit(): void {
        this.connectMenuOpen = false;
        this.asyncUpdateTypeList();
        this.asyncUpdateList();
        this.initMqtt();
    }

    initMqtt() {
        const url = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
        const listenerTopic = "/thingspin/connect/#" as string;

        this.mqttClient = mqtt.connect(url)
            .subscribe(listenerTopic)
            .on("message", this.recvMqttMessage);
    }

    recvMqttMessage(topic: string, payload: Uint16Array) {
        const topics: string[] = topic.split("/"),
            str: string = payload.toString();

        let obj: string | object;
        try {
            obj = JSON.parse(str); // parse try
        } catch (e) {
            // is not json object
            obj = str;
        }
        console.log(topics, obj);
    }

    publishMqtt(topic: string, message: string): void {
        if (!this.mqttClient) {
            return;
        }

        this.mqttClient.publish(topic, message, this.mqttPubOpts);
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
            const list = this.groupList[type];
            for (const index in list) {
                const item: TsConnect = list[index];
                if (item.id === id) {
                    const baseTopic = `/thingspin/connect/${item.flow_id}`;
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
            const list = this.groupList[type];
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
            const { type } = item;

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
