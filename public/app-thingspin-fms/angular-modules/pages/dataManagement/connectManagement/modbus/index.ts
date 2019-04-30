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

  modbusParams: any;
  fcSelected: string;
  typeSelected: string;

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

  //edit view
  editAddress: any;
  editName: any;
  editQuantity: any;
  editFC: any;
  editType: any;

  defTabulatorOpts: object;
  orderTable: any;

  isAddressEditView: boolean;
  isAddressEditBtn: boolean;

  tableindex: any;
  tableList: any;
  /** @ngInject */
  constructor(private $scope , private backendSrv: BackendSrv) {
    //for tabulator table
    this.modbusParams = {
      functioncodes: ['Coil Status','Input Status','Holding Registers','Input Registers'],
      datatypes: ['String','Numbers']
    };
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
    this.isAddressEditView = false;
    this.isAddressEditBtn = true;
    this.fcSelected = this.modbusParams.functioncodes[2];//holding registers
    this.typeSelected = this.modbusParams.datatypes[0];

    this.tableindex = 1;
    this.tableList = [];
    console.log(this.isAddressEditView);
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
 deleteAddress() {
   console.log("delete button");
 }
 getTablelistData() {
  const tableData = this.orderTable.getData();
  console.log(tableData);
  //tableData.length -- array count
  //tableData[0].address
}
 resetEditData() {
   this.editAddress = "";
   this.editName = "";
   this.editQuantity = "";
   this.editFC = "";
   this.editType = "";
   this.tableList = [];
 }
 addTableData() {
  //{title: "No", field: "idx"},
  //{title: "ADDRESS", field: "address"},
  //{title: "Name", field: "name"},
  //{title: "Quanntity", field: "quantity"},
  //{title: "Function Code", field: "fc"},
  //{title: "Type", field: "type"},
   //data push
  console.log("addtabledata");
  const tableData = {
    address: this.editAddress,
    name: this.editName,
    quantity: this.editQuantity,
    fc: this.editFC,
    type: this.editType
  };
  this.tableList.push(tableData);
  this.orderTable.setData(this.tableList);

  //add data and hide add-list-edit
  this.isAddressEditView = false;
  this.isAddressEditBtn = true;
  //reset data
  this.resetEditData();
 }
editAddressList() {
    //edit view
    //editAddress: any;
    //editName: any;
    //editQuantity: any;
    //editFC: any;
    //editType: any;
    //functioncodes: ['Coil Status','Input Status','Holding Registers','Input Registers'],
    //datatypes: ['String','Numbers']
  console.log("+Address List");
  console.log(this.editAddress+" "+this.editName+" "+this.fcSelected+" "+this.typeSelected);

  //check & convert
  if (this.fcSelected === 'Holding Registers') {
    this.editFC = 'HoldingRegister';
  } else if (this.fcSelected === 'Coil Status') {
    this.editFC = 'Coil';
  } else if (this.fcSelected === 'Input Status') {
    this.editFC = 'Input';
  } else if (this.fcSelected === 'Input Registers') {
    this.editFC = 'InputRegister';
  }

  if (this.typeSelected === 'String') {
    this.editType = 'string';
  } else if (this.fcSelected === 'Numbers') {
    this.editType = 'float32';
  }

  console.log(this.editFC+' '+this.editType);
  this.addTableData();
}

onShowAddressEditView() {
  console.log("function called");
  if (this.isAddressEditView) {
    this.isAddressEditView = false;
    console.log("value is false");
    this.isAddressEditBtn = true;
  }else {
    this.isAddressEditView = true;
    console.log("value is true");
    this.isAddressEditBtn = false;
    console.log($('gf-form-input width-9'));
  }
}

 //--Tabulator 관련
 initAddressTable2() {
  const opts = Object.assign({ // deep copy
    rowClick: (e, row) => { //trigger an alert message when the row is clicke
    },
  }, this.defTabulatorOpts);
  this.orderTable = new Tabulator("#addressTable",opts);
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
        "IsEnable": false,
        "FlowId" : "test_modbus8",
        "DataType": "HoldingRegister",
        "Addr" : "40031",
        "Quantity" : "9",
        "Intervals" : "1",
        "Host" : "192.168.0.188",
        "Port" : "502",
        "UnitId" : 1,
        "TimeOut" : 1000,
        "ReTimeOut" : 2000
      },
      "intervals": 1
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
