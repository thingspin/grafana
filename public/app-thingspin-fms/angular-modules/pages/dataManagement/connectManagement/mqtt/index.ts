import angular from 'angular';
import "./index.scss";
import { BackendSrv } from 'app/core/services/backend_srv';
// import { url } from 'inspector';
// import { Portal } from '@grafana/ui';

const DEF_URL = "localhost";
const DEF_PORT = "1884";
const DEF_TOPIC = "/#";

export class TsMqttConnectCtrl {
  static template: any = require("./index.html");

  mqtt: any;
  /** @ngInject */
  constructor(private backendSrv: BackendSrv) {
     this.mqtt = {
       url: DEF_URL,
       port: DEF_PORT,
       name: DEF_TOPIC
     };
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
      ctrl.scope = scope;
  }

  addMqttCollector(scope: any, url: any, port: any, name: any) {
    console.log(url);
    console.log(port);
    console.log(name);
    const object = {
      "FlowId" : "mqtt" + "flow-1",
      "MqttUrl" : url,
      "MqttPort" : port,
      "MqttTopic" : name
    };

    console.log(object);

    this.backendSrv.post('/thingspin/flow-node/mqtt', object).then((result: any) => {
      console.log(result);
    });
  }
}
export function tsMqttConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/dataManagement/connectManagement/mqtt/index.html',
    controller: TsMqttConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {}
  };
}

angular.module('thingspin.directives').directive('tsMqttConnect', tsMqttConnectDirective);
