import angular from 'angular';
import { BackendSrv } from 'app/core/services/backend_srv';

export class TsModbusConnectCtrl {
  static template = require("./index.html");
  connName: any; // connection name
  modbusHost: any; // modbus Host ip
  modbusPort: any; // modbus Host Port
  modbusAddress: any; // modbus Address
  modbusQuantity: any; // modbus Address from Quantity
  modbusFC: any;
  modbusUnitID: any;
  modbusTimeOut: any; // connection time out
  modbusReTimeOut: any; // re connection time out
  modbusReadIntervals: any; //scan interval
  /** @ngInject */
  constructor(private backendSrv: BackendSrv) {}

  testInit() {
    //for test
    this.connName = "testModbus";
    this.modbusHost = "192.168.0.188";
    this.modbusPort = "502";
    this.modbusAddress = "40001";
    this.modbusQuantity = "9";
  }

  testCreate() {
    const object = {
      "FlowId" : "test_modbus1"
    };
    console.log(object);
    this.backendSrv.post('/thingspin/flow-node/modbus',object).then((result: any) => {
      console.log(result);
    });
  }

}

/** @ngInject */
export function tsModbusConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsModbusConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsModbusConnect', tsModbusConnectDirective);
