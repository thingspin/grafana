import angular from 'angular';
import "./index.scss";
import { TsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from 'tabulator-tables';
//import $ from 'jquery';
import { appEvents } from 'app/core/core';
import uid from "shortid";

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

export class TsModbusConnectCtrl {
  static template = require("./index.html");
  selectObj: any;
  enEtcMenu: boolean;
  showObj: object;

  modbusParams: any;
  quantitySelected: string;
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
  modbusinfluxID: any;
  //edit view
  editIdx: any;
  editAddress: any;
  editName: any;
  editQuantity: any;
  editFC: any;
  editType: any;

  defTabulatorOpts: object;
  orderTable: any;
  list: TsConnect[];

  isAddressEditView: boolean;
  isAddressEditBtn: boolean;
  isAddressEditmode: boolean;
  isParamsComplete: boolean; // check param inputs
  isEditMode: boolean;

  isConnCheckMode: boolean;

  tableindex: any;
  tableList: any;
  tableListsize: any;
  tableData: any;
  nodeModbusGetteritem: any;
  nodeInjectWiresList: any;
  templateObject: any; //modbus node-red template
  FlowId: any;

  //for test
  getterparserArray: any;

  //editmode
  indexID: number = null; //data connection id

   // MQTT
   readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
   readonly listenerTopic: string = "/thingspin/connect/+/status" as string;
   readonly connectTimeout: number = 15000;
   mqttClient: TsMqttController; // mqtt client instance
   timer: NodeJS.Timer | null;
   enableNodeSet: boolean;
   connectStatus: string;

   connectIcon: any;

  /** @ngInject */
  constructor(
    private $scope ,
    private $location: angular.ILocationService,
    private $compile: angular.ICompileService, $routeParams,
    private backendSrv: BackendSrv) {
    //for tabulator table
    this.modbusParams = {
      quantity: ['1','2','3','4','5','6','7','8','9'],
      functioncodes: ['Coil Status','Input Status','Holding Registers','Input Registers'],
      datatypes: ['String','Numbers']
    };

    this.getterparserArray = [];

    this.modbusinfluxID = "";

    this.isConnCheckMode = false;
    this.isParamsComplete = false;
    this.isAddressEditView = false;
    this.isAddressEditBtn = true;
    this.isAddressEditmode = false;
    this.quantitySelected = this.modbusParams.quantity[0]; // default quantity 1
    this.fcSelected = this.modbusParams.functioncodes[2];//holding registers
    this.typeSelected = this.modbusParams.datatypes[0];

    this.editIdx = 0;
    this.tableList = [];

    this.connectIcon = 'icon-ts-power';
    this.initTable();
    this.initMqtt();
    if ($routeParams.id) {
      console.log("route id: "+$routeParams.id);
      this.asyncDataLoader($routeParams.id);
      this.modbusinfluxID = $routeParams.id;
      this.isEditMode = true;
    } else {
      console.log("nothing");
      this.isEditMode = false;
    }

  }

  async initMqtt(): Promise<void> {
    console.log("initmqtt");
    console.log(this.listenerTopic);
    this.mqttClient = new TsMqttController(this.mqttUrl, this.listenerTopic);

    try {
        await this.mqttClient.run(this.recvMqttMessage.bind(this));
        console.log("MQTT Connected");
    } catch (e) {
        console.error(e);
    }
  }
  recvMqttMessage(topic: string, payload: string): void {
    //console.log("recv-MQTT: "+topic+" current flowid: "+this.FlowId);
    const topics = topic.split("/");
    const flowId = topics[topics.length - 2];
      if (flowId === this.FlowId) {
        clearTimeout(this.timer);
        this.setConnectStatus(payload);
      }
    }
  setConnectStatus(color: string): void {
    this.connectStatus = color;
    console.log("status color: "+color);
    if (color === "green") {
        this.enableNodeSet = true;
    } else if (color === "yellow") {
      //this.connectIcon = "icon-ts-connection-loding";
      this.connectIcon = "icon-ts-connection_off";
      this.connectStatus = "red";
    } else if (color === "red") {
      this.connectIcon = "icon-ts-connection_off";
    }

    this.$scope.$applyAsync();
  }

  onLoadData(item) {
    console.log(item);
    this.indexID = item.id;
    this.connName = item.name;
    this.modbusReadIntervals = item.intervals;
    const getParams = item.params;
    this.FlowId = getParams.FlowId;
    //this.tableData.length = getParams.AddressListCount;
    this.modbusHost = getParams.Host;
    this.modbusPort = getParams.Port;
    this.modbusUnitID = getParams.UnitId;
    this.modbusTimeOut = getParams.TimeOut;
    this.modbusReTimeOut = getParams.ReTimeOut;
    this.nodeModbusGetteritem = getParams.AddressNode;
    this.nodeInjectWiresList = getParams.InjectWires;
    this.tableData = getParams.Tabledata;

    if (getParams.AddressListCount > 0) {
      //console.log("table upadte");
      this.editIdx = getParams.AddressListCount;
      this.tableList = this.tableData;
      this.orderTable.setData(this.tableList);
    }
    //
  }
  async asyncDataLoader(id): Promise<void> {
    //console.log("asyncDataLoader");
    try {
        const list = await this.backendSrv.get("/thingspin/connect/" + id);
        //console.log(list);
        this.onLoadData(list);
        this.$scope.$applyAsync();
    } catch (e) {
        console.error(e);
    }
  }

 //button action
 connTest() {
   this.isConnCheckMode = true;
   this.checkParams();
 }
 close() {
  this.$location.path(`/thingspin/manage/data/connect/`);
}
 redirect(connid) {
  this.$location.path(`/thingspin/manage/data/connect/modbus/`+connid);
 }

 addAddress() {
   console.log("addAddress button");
   this.orderTable.addRow({});
 }
 deleteAddress() {
   console.log("delete button");
 }
objectTest() {

  const str = "\""+"TS-MODBUS-GETTER-CONN-"+"test"+"\"";
 // str = "\""+str+"\"";
  console.log(str);
  //console.log(Array.from([1,2,3]));
}

//---table 관련
resetEditData() {
  this.editAddress = "";
  this.editName = "";
  this.editQuantity = "";
  this.editFC = "";
  this.editType = "";
  this.isAddressEditmode = false;
  //this.tableList = [];
}
 getTablelistData() {
  this.tableData = [];
  this.tableData = this.orderTable.getData();
  this.tableListsize = this.tableData.length;
  //console.log(this.tableData);
}
updateTableData() {
  this.editIdx = 0;
  this.tableData = [];
  this.tableData = this.orderTable.getData();
  this.tableListsize = this.tableData.length;
  //console.log(this.tableListsize);
  //tableData[0].address
    for (let i = 0; i < this.tableListsize; i++) {
      this.tableData[i].idx = ++this.editIdx;
      console.log(this.editIdx);
    }
    console.log(this.tableData);
    this.tableList = this.tableData;
    this.orderTable.setData(this.tableList);
 }

 addTableData() {
   if (this.isAddressEditmode) {
      //console.log("edit-tabledata");
      const tableData = {
        idx: this.editIdx,
        address: this.editAddress,
        name: this.editName,
        quantity: this.editQuantity,
        fc: this.editFC,
        type: this.editType
      };
      this.tableList[this.editIdx-1] = tableData;
      this.orderTable.setData(this.tableList);
      //add data and hide add-list-edit
      this.isAddressEditView = false;
      this.isAddressEditBtn = true;
      //reset data
      this.resetEditData();
   } else {
      this.editIdx = this.editIdx+1; // index update
      //console.log("add-tabledata");
      const tableData = {
        idx: this.editIdx,
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
 }

editAddressList() {
    //console.log(this.editFC+' '+this.editType);
    //check_edit param
    if (this.editAddress) {
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

        this.editQuantity = this.quantitySelected;

        this.addTableData();
    } else {
              if (!this.editAddress) {
                appEvents.emit('alert-warning', ['MODBUS 수집 Address를 설정 하세요.']);
              }
    }
}
onShowAddressEditView() {
  //console.log("function called" + " edit-mode: "+this.isAddressEditmode);
  if (this.isAddressEditView) {
    this.isAddressEditView = false;
    //console.log("value is false");
    this.isAddressEditBtn = true;
    this.resetEditData();
  }else {
    this.isAddressEditView = true;
    //console.log("value is true");
    this.isAddressEditBtn = false;
    //console.log($('gf-form-input width-9'));
  }
}

showEdit(idx: any): void {
  this.getTablelistData();
  const preData = this.tableData[idx-1];
  //set data
  this.editIdx = preData.idx;
  this.editAddress = preData.address;
  this.editName = preData.name;
  this.editQuantity = preData.quantity;
  this.editFC = preData.fc;
  this.editType = preData.type;

  this.isAddressEditmode = true;
  this.onShowAddressEditView();
}

removeEdit(idx: any): void {
  console.log("removeEdit");
  this.getTablelistData();
  delete this.tableList[idx-1];
  this.orderTable.setData(this.tableList);
  this.updateTableData();
}
 //--Tabulator 관련
 initTable(): void {
   console.log("initTable");
        const actionFormatter = (cell: any, formatterParams, onRendered: Function): void => {
          const data = cell.getData();
          //console.log(data);
          const $html: JQLite = this.$compile(/*html*/`
              <button class="btn" ng-click="ctrl.showEdit(${data.idx})">
                  <i class="tsi icon-ts-create"></i>
              </button>
              <button class="btn" ng-click="ctrl.removeEdit(${data.idx})">
                  <i class="tsi icon-ts-delete"></i>
              </button>
          `)(this.$scope);

          onRendered((): void => {
              $(cell.getElement()).append($html);
          });
      };
      const headerClickEvt = (e: any, column: any) => {
        console.log("headerClick");
        this.$scope.$applyAsync();
    };

    const tableOpts: object = {
        pagination: "local",
        paginationSize: 10,
        responsivelayout: true,
        layout: "fitColumns",
        columns: [
          {title: "No", field: "idx"},
          {title: "ADDRESS", field: "address"},
          {title: "Name", field: "name"},
          {title: "Quanntity", field: "quantity"},
          {title: "Function Code", field: "fc"},
          {title: "Type", field: "type"},
          { title: "동작", formatter: actionFormatter, headerClick: headerClickEvt, },
        ],
        renderStarted: () => {
            this.$scope.$applyAsync();
        },
        renderComplete: () => {
            // this.tableInst.redraw();
        }
    };
    this.orderTable = new Tabulator("#modbus-addressTable",tableOpts);
 }
//-----------------------------
testAddGetter1(address, quantity, functioncode,flowid,posY) {
  const addNodeinfo = {
    getterId: "TS-MODBUS-GETTER-"+address+"-"+flowid,
    getterName: address+"-Getter",
    getterType: functioncode,
    getterAddress : address,
    getterQuantity : quantity,
    getterServer: "TS-MODBUS-SERVER-ID-"+flowid,
    getterPos: 240+posY,
    getterWires: "TS-MODBUS-P-"+address+"-"+flowid,
    parserId: "TS-MODBUS-P-"+address+"-"+flowid,
    // tslint:disable-next-line:max-line-length
    parserFunction: "var Total_item = "+quantity+";\n\nvar res = [\n            {\n                measurement:'modbus',\n                fields:{}\n            }\n            ];\n            \nfor(var i = 0; i < Total_item; i++){\n    var num = i;\n    var n = num.toString();\n    var str = '"+address+"'+'_'+n+'th';\n    \n    var value = msg.payload[i];\n    res[0].fields[str] = value;\n}\n\nmsg.payload = res;\n\n\nreturn msg;",
    parserPos: 220+posY,
    parserWires: "TS-MODBUS-JOIN-"+flowid
  };
  this.getterparserArray.push(addNodeinfo);
}

//template 관련
addModbusGETTER( address, quantity, functioncode,flowid,posY,interval) {
  //this.nodeModbusGetterList = "";
  const objInjector =      {
    "id": "TS-MODBUS-INJECT-"+address+"-"+flowid,
    "type": "inject",
    "z": "8900476a.91f358",
    "name": "",
    "topic": "",
    "payload": "",
    "payloadType": "date",
    "repeat": interval,
    "crontab": "",
    "once": true,
    "onceDelay": 0.1,
    "x": 110,
    "y": 160+posY,
    "wires": [
        [
          "TS-MODBUS-GETTER-"+address+"-"+flowid
        ]
    ]
  };
  const objGetter = {
    "id": "TS-MODBUS-GETTER-"+address+"-"+flowid,
    "type": "modbus-getter",
    "z": "8900476a.91f358",
    "name": address+"-Getter",
    "showStatusActivities": false,
    "showErrors": false,
    "logIOActivities": false,
    "unitid": "",
    "dataType": functioncode,
    "adr": address,
    "quantity": quantity,
    "server": "TS-MODBUS-SERVER-ID-"+flowid,
    "useIOFile": false,
    "ioFile": "",
    "useIOForPayload": false,
    "x": 340,
    "y": 240+posY,
    "wires": [
        [
          "TS-MODBUS-P-"+address+"-"+flowid
        ],
        []
    ]
  };
  const objParser = {
    "id":  "TS-MODBUS-P-"+address+"-"+flowid,
    "type": "function",
    "z": "8900476a.91f358",
    "name": "Parser",
    // tslint:disable-next-line:max-line-length
    "func": "var Total_item = "+quantity+";\n\nvar res = [\n            {\n                measurement:'modbus',\n                fields:{}\n            }\n            ];\n            \nfor(var i = 0; i < Total_item; i++){\n    var num = i;\n    var n = num.toString();\n    var str = '"+address+"'+'_'+n+'th';\n    \n    var value = msg.payload[i];\n    res[0].fields[str] = value;\n}\n\nmsg.payload = res;\n\n\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "x": 510,
    "y": 220+posY,
    "wires": [
        [
          "TS-MODBUS-JOIN-"+flowid
        ]
    ]
  };

  /*
  const strObjGetter = JSON.stringify(objGetter);
  const strObjParser = JSON.stringify(objParser);
  this.nodeModbusGetteritem = this.nodeModbusGetteritem+strObjGetter+","+strObjParser+",";
  this.nodeInjectWiresList = this.nodeInjectWiresList+","+"\""+"TS-MODBUS-GETTER-"+address+"-"+flowid+"\"";
  */
 const strobjInjector = JSON.stringify(objInjector);
 const strObjGetter = JSON.stringify(objGetter);
 const strObjParser = JSON.stringify(objParser);
 this.nodeModbusGetteritem = this.nodeModbusGetteritem+strobjInjector+","+strObjGetter+","+strObjParser+",";
 //this.nodeInjectWiresList = this.nodeInjectWiresList+","+"\""+"TS-MODBUS-GETTER-"+address+"-"+flowid+"\"";
}

checkParams() {
  this.isParamsComplete = false;
  // tslint:disable-next-line:max-line-length
  if (this.connName && this.modbusHost && this.modbusPort && this.modbusUnitID && this.modbusTimeOut && this.modbusReTimeOut && this.modbusReTimeOut && this.modbusReadIntervals) {
    this.isParamsComplete = true;
    console.log('input check complete');
    this.testCreate();
  } else {
            if (!this.connName) {
              appEvents.emit('alert-warning', ['수집기 이름을 설정 하세요.']);
            }else if (!this.modbusHost) {
              appEvents.emit('alert-warning', ['HOST IP를 입력 하세요.']);
            }else if (!this.modbusPort) {
              appEvents.emit('alert-warning', ['PORT 넘버를 입력 하세요.']);
            }else if (!this.modbusUnitID) {
              appEvents.emit('alert-warning', ['Unit ID를 입력 하세요.']);
            }else if (!this.modbusTimeOut) {
              appEvents.emit('alert-warning', ['TimeOut을 입력 하세요.']);
            }else if (!this.modbusReTimeOut) {
              appEvents.emit('alert-warning', ['Re-TimeOut을 입력 하세요.']);
            }else if (!this.modbusReadIntervals) {
              appEvents.emit('alert-warning', ['데이터 수집 주기를 설정 하세요.']);
            }
  }
}

testCreate() {

    this.FlowId = uid.generate();
    this.nodeModbusGetteritem = "";
    //this.nodeInjectWiresList = "\""+"TS-MODBUS-GETTER-CONN-"+this.FlowId+"\"";
    this.nodeInjectWiresList = "";
    this. getTablelistData();
    console.log("list: "+this.tableData.length);
    if (this.tableData.length > 0) {
      for (let i = 0; i < this.tableData.length; i++) {
        this.addModbusGETTER(this.tableData[i].address,this.tableData[i].quantity,this.tableData[i].fc,this.FlowId,i*20,this.modbusReadIntervals);
        //this.testAddGetter1(this.tableData[i].address,this.tableData[i].quantity,this.tableData[i].fc,this.FlowId,i*20);
      }

    }

    const object = {
      name : this.connName,
      params: {
        FlowId : this.FlowId,
        AddressListCount: this.tableData.length,
        Intervals : this.modbusReadIntervals,
        Host : this.modbusHost,
        Port : this.modbusPort,
        UnitId : this.modbusUnitID,
        TimeOut : this.modbusTimeOut,
        ReTimeOut : this.modbusReTimeOut,
        AddressNode : this.nodeModbusGetteritem,
        InjectWires : this.nodeInjectWiresList,
        Tabledata : this.tableData,
        influxID : this.modbusinfluxID,
      },
      intervals: this.modbusReadIntervals
    };
    console.log(object);

    if (this.isEditMode) {
      console.log("EDIT mode SAVE: "+this.indexID);
      this.backendSrv.put("/thingspin/connect/"+this.indexID,object).then((result: any) => {
        console.log(result);
        if (this.isConnCheckMode) {
          console.log("redirect");
          this.redirect(this.indexID);
          location.reload();
        }else {
          this.close();
        }
      });
    } else {
      console.log("normal mode SAVE");
      this.backendSrv.post("/thingspin/connect/modbus",object).then((result: any) => {
        console.log(result);
        if (this.isConnCheckMode) {
          this.redirect(result);
        }else {
          this.close();
        }
      });
    }
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
