import angular from 'angular';
// import $ from 'jquery';
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
  valueSelected: string;
  typeSelected: string;
  isTopicEditView: boolean;
  isTopicEditBtn: boolean;

  element: any;

  /** @ngInject */
  constructor(private backendSrv: BackendSrv) {
     this.mqtt = {
       url: DEF_URL,
       port: DEF_PORT,
       name: DEF_TOPIC,
       values: ['String', 'Integer', 'Float', 'Boolean'],
       types: ['String','#','+']
     };
     this.valueSelected = this.mqtt.values[0];
     this.typeSelected = this.mqtt.types[0];
     this.isTopicEditView = false;
     this.isTopicEditBtn = true;
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
      ctrl.scope = scope;
      // const tagInputView = $('#tag-input');
      // console.log(tagInputView);
      // tagInputView.css("display","none");
      this.element = elem;
  }

  close() {
    console.log("close");
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

    this.backendSrv.post('/thingspin/connect/mqtt', object).then((result: any) => {
      console.log(result);
    });
  }

  onShowTopicEditView() {
    console.log("function called");
    if (this.isTopicEditView) {
      this.isTopicEditView = false;
      console.log("value is false");
      this.isTopicEditBtn = true;
    }else {
      this.isTopicEditView = true;
      console.log("value is true");
      this.isTopicEditBtn = false;
      console.log($('gf-form-input width-9'));
    }
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
