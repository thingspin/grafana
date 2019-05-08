import angular from 'angular';
import "./index.scss";
import { TsConnect } from "app-thingspin-fms/models/connect";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from 'tabulator-tables';
//import $ from 'jquery';
//import { appEvents } from 'app/core/core';
import uid from "shortid";

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

  isEditMode: boolean;

  tableindex: any;
  tableList: any;
  tableListsize: any;
  tableData: any;
  nodeModbusGetteritem: any;
  nodeInjectWiresList: any;
  templateObject: any; //modbus node-red template
  FlowId: any;

  //editmode
  indexID: number = null;

  /** @ngInject */
  constructor(
    private $scope ,
    private $location: angular.ILocationService,
    private $compile: angular.ICompileService, $routeParams,
    private backendSrv: BackendSrv) {
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
    this.isAddressEditmode = false;
    this.fcSelected = this.modbusParams.functioncodes[2];//holding registers
    this.typeSelected = this.modbusParams.datatypes[0];

    this.editIdx = 0;
    this.tableList = [];
    this.initTable();
    if ($routeParams.id) {
      console.log("route id: "+$routeParams.id);
      this.asyncDataLoader($routeParams.id);
      this.isEditMode = true;
    } else {
      console.log("nothing");
      this.isEditMode = false;
    }

  }

  onLoadData(item) {
    console.log(item);
    /*
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
      tabledata : this.tableData
    //
    */
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
      console.log("table upadte");
      this.editIdx = getParams.AddressListCount;
      this.tableList = this.tableData;
      this.orderTable.setData(this.tableList);
    }
    //
  }
  async asyncDataLoader(id): Promise<void> {
    console.log("asyncDataLoader");
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
 close() {
  this.$location.path(`/thingspin/manage/data/connect/`);
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
    //console.log(this.editFC+' '+this.editType);
    this.addTableData();
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
                  <i class="fa fa-pencil"></i>
              </button>
              <button class="btn" ng-click="ctrl.removeEdit(${data.idx})">
                  <i class="fa fa-trash"></i>
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
        layout: "fitColumns",
        // responsiveLayout: true,
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
    this.orderTable = new Tabulator("#addressTable",tableOpts);
 }
//-----------------------------
//template 관련
addModbusGETTER( address, quantity, functioncode,flowid,posY) {
  //this.nodeModbusGetterList = "";
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

  const strObjGetter = JSON.stringify(objGetter);
  const strObjParser = JSON.stringify(objParser);
  this.nodeModbusGetteritem = this.nodeModbusGetteritem+strObjGetter+","+strObjParser+",";
  this.nodeInjectWiresList = this.nodeInjectWiresList+","+"\""+"TS-MODBUS-GETTER-"+address+"-"+flowid+"\"";
}

  testCreate() {

    if (this.isEditMode === false) {
      this.FlowId = uid.generate();
    }
    //for test
    this.nodeModbusGetteritem = "";
    this.nodeInjectWiresList = "\""+"TS-MODBUS-GETTER-CONN-"+this.FlowId+"\"";
    this. getTablelistData();
    if (this.tableData.length > 0) {
      for (let i = 0; i < this.tableData.length; i++) {
        this.addModbusGETTER(this.tableData[i].address,this.tableData[i].quantity,this.tableData[i].fc,this.FlowId,i*20);
      }

    }
    //addModbusGETTER( address, unitid, quantity, functioncode,flowid)
    //this.addModbusGETTER(40001,1,"HoldingRegister",this.FlowId);
    //console.log(this.nodeModbusGetteritem);
    //console.log(this.nodeInjectWiresList);
    //const obj2 = {"name" : "test2"};
    //jsonarray.push(obj);
    //jsonarray.push(obj2);
    //this.templateObject = JSON.stringify(obj);
    //this.templateObject = this.templateObject+',';
    //console.log(this.templateObject);
    //this.connName = "TEST_MODBUS";
    //for teset

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
        Tabledata : this.tableData
      },
      intervals: this.modbusReadIntervals
    };
    console.log(object);

   // this.backendSrv.post("/thingspin/connect/modbus",object).then((result: any) => {
   //   console.log(result);
   // });

    if (this.isEditMode) {
      console.log("EDIT mode SAVE: "+this.indexID);
      this.backendSrv.put(`/thingspin/connect/${this.indexID}`,object).then((result: any) => {
        console.log(result);
        this.close();
      });
    } else {
      console.log("normal mode SAVE");
      this.backendSrv.post("/thingspin/connect/modbus",object).then((result: any) => {
        console.log(result);
        this.close();
      });
    }
  }

  testCreate2() {
    const object = {
      "name": "modbus 수집기",
      "params": {
        "FlowId" : "test_modbus11",
        "DataType": "HoldingRegister",
        "Addr" : "40031",
        "Quantity" : 9,
        "Intervals" : 1,
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
