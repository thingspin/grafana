import angular from 'angular';
import "./index.scss";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from 'tabulator-tables';
//import $ from 'jquery';
import { appEvents } from 'app/core/core';

export class TsModbusConnectCtrl {
  static template = require("./index.html");
  selectObj: any;
  enEtcMenu: boolean;
  showObj: object;

  connName: any; // connection name
  modbusHost: any; // modbus Host ip
  modbusPort: any; // modbus Host Port
  modbusAddress: any; // modbus Address
  modbusQuantity: any; // modbus Address from Quantity
  modbusFC: any;
  modbusType: any;
  modbusUnitID: any;
  modbusTimeOut: any; // connection time out
  modbusReTimeOut: any; // re connection time out
  modbusReadIntervals: any; //scan interval

  defTabulatorOpts: object;
  orderTable: any;

  /** @ngInject */
  constructor(private $scope , private backendSrv: BackendSrv) {
    //for tabulator table
    this.defTabulatorOpts = {
      pagination: "local",
      paginationSize: 20,
      selectable: 1,
      responsivelayout: true,
      height: "200px",
      layout: "fitColumns",
      columns: [
        {title: "No", field: "idx"},
        {title: "ADDRESS", field: "address"},
        {title: "Name", field: "name"},
        {title: "Quanntity", field: "quantity"},
        {title: "Function Code", field: "fc"},
        {title: "Type", field: "type"},
      ],
    };

  }

  testInit() {
    //for test
    this.connName = "testModbus";
    this.modbusHost = "192.168.0.188";
    this.modbusPort = "502";
    this.modbusAddress = "40001";
    this.modbusQuantity = "9";
  }
  /*
  */
 //button action
 goPrev() {
 }
 addAddress() {
   console.log("addAddress button");
   this.orderTable.addRow({});
 }
 editAddress() {
   console.log("edit button");
 }
 deleteAddress() {
   console.log("delete button");
 }
 getAddressTableData() {
  const tableData = this.orderTable.getData();
  console.log(tableData);
  //tableData.length -- array count
  //tableData[0].address
}
 //--Tabulator 관련
 initAddressTable2() {
  const opts = Object.assign({ // deep copy
    rowClick: (e, row) => { //trigger an alert message when the row is clicke
    },
  }, this.defTabulatorOpts);
  this.orderTable = new Tabulator("#addressTable",opts);
 }
 initAddressTable() {
   /*
  const opts = Object.assign({ // deep copy
      rowClick: (e, row) => { //trigger an alert message when the row is clicke
          //intput init
          this.showEtcMenu(row.getData());
          this.showSelectedEdit(row.getData());
      },
  }, this.defTabulatorOpts);
*/
    this.orderTable = new Tabulator("#addressTable", {
      //height: "311px",
      //addRowPos: "bottom",
      pagination: "local",
      paginationSize: 20,
      selectable: 1,
      responsivelayout: true,
      //height: "200px",
      layout: "fitColumns",
      columns: [
          {title: "ADDRESS", field: "address"},
          {title: "Name", field: "name"},
          {title: "Quanntity", field: "quantity"},
          {title: "Function Code", field: "fc"},
          {title: "Type", field: "type"},
        ],
      });
  //this.orderTable = new Tabulator("#addressTable",opts);
  }

  showEtcMenu(obj) {
    this.selectObj = obj;
    this.enEtcMenu = true;

    this.modbusAddress = this.selectObj.Address;
    this.modbusFC = this.selectObj.FC;
    this.modbusQuantity = this.selectObj.Quantity;
    this.modbusType = this.selectObj.Type;
    console.log(this.selectObj.Address);
    console.log(this.selectObj.FC);
    console.log(this.selectObj.Quantity);
    console.log(this.selectObj.Type);
    this.$scope.$apply();
  }

  showSelectedEdit(obj) {
    this.showObj = obj;
    appEvents.emit('show-modal',{
    templateHtml: require('./editModal.html'),
    model: this,
    });
   }

  testCreate() {
    const object = {
      "name": "modbus 수집기1",
      "params": {
        "FlowId" : "test_modbus3",
        "DataType": "HoldingRegister",
        "Addr" : "40031",
        "Quantity" : "9",
        "Intervals" : "1",
        "Host" : "192.168.0.188",
        "Port" : "502",
        "UnitId" : 1,
        "TimeOut" : 1000,
        "ReTimeOut" : 2000
      }
    };
    console.log(object);

    this.backendSrv.post("/thingspin/connect/modbus",object).then((result: any) => {
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
