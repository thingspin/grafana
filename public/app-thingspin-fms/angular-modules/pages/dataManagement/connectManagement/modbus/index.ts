// 3rd party libs
import _ from "lodash";
import angular, { IScope, ITimeoutService } from 'angular';
const uid = require("shortid");

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { BackendSrv } from 'app/core/services/backend_srv';
import { dateTime } from '@grafana/data';

// Thingspin libs
import "./index.scss";
import TsMqttController from 'app-thingspin-fms/utils/mqttController';

export interface TableModel {
  // table header data
  rowCount: number; // 페이지당 표시할 행(row) 개수
  selectOpts: number[];
  // table body data
  pageNode: any[];
  // table footer data
  currPage: number;
  maxPage: number;
  maxPageLen: number; // paging 최대 표시 개수
}

interface ModbusTableData {
  idx: any;
  name: any;
  address: any;
  functioncode: any;
  quantity: any;
  datatype: any;
}

interface TagList {
  name: any;
  type: any;
}

export function formatDate(date: Date): string {
  return dateTime(date).format('YYYY-MM-DD_HH:mm:ss');
}

export class TsModbusConnectCtrl {
  static template = require("./index.html");

  modbusParams = {
    quantity: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    functioncodes: ['Coil Status', 'Input Status', 'Holding Registers', 'Input Registers'],
    datatypes: ['decimal']
    //datatypes: ['decimal','Hex','String']
  };
  quantitySelected = this.modbusParams.quantity[0];  // default quantity 1
  fcSelected = this.modbusParams.functioncodes[2];//holding registers
  typeSelected = this.modbusParams.datatypes[0];

  nodeRedFlowName: any;

  connName: any; // connection name
  modbusHost: any; // modbus Host ip
  modbusPort: any; // modbus Host Port
  modbusQuantity: any; // modbus Address from Quantity
  modbusUnitID: any;
  modbusTimeOut: any; // connection time out
  modbusReTimeOut: any; // re connection time out
  modbusReadIntervals: any; //scan interval
  modbusinfluxID = this.$routeParams.id;

  //edit view
  editIdx = 0;
  editAddress: any;
  editName: any;
  editQuantity: any;
  editFC: any;
  editType: any;

  orderTable: any;

  isAddressEditView = false;
  isAddressEditBtn = true;
  isAddressEditmode = false;
  isParamsComplete = false; // check param inputs
  isEditMode = !!this.$routeParams.id;

  isConnCheckMode = false;

  tableList: any[] = [];
  nodeModbusGetteritem: any;
  nodeInjectWiresList: any;
  FlowId: any;

  PtagList: TagList[];
  //for test
  requestHelp: string;

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

  connectIcon = 'icon-ts-power';

  list: ModbusTableData[];
  // table
  tData: TableModel = {
    rowCount: 16,
    selectOpts: [16, 32, 48],
    currPage: 0,
    maxPage: 0,
    maxPageLen: 10,
    pageNode: [],
  };

  // UI data
  readonly errorComment: string[] = [
    `MODBUS 서버가 동작 중이지 않을 수 있습니다.`,
    `ThingSPIN에서 MODBUS 서버에 접근 할 수 있는 환경이 아닐 수 있습니다.`,
    `네트워크 상태에 따라 서버에 연결이 지연 될 수 있습니다.`,
    `자세한 사항은 MODBUS서버 관리자에 문의 바랍니다.`,
  ];

  /** @ngInject */
  constructor(
    private $scope: IScope,
    private $routeParams: angular.route.IRouteParamsService,
    private $location: angular.ILocationService,
    private backendSrv: BackendSrv,
    private $timeout: ITimeoutService) {
    //for tabulator table
    this.initMqtt();

    if ($routeParams.id) {
      this.asyncDataLoader($routeParams.id);
    }
  }

  async initMqtt(): Promise<void> {
    this.mqttClient = new TsMqttController(this.mqttUrl, this.listenerTopic);

    try {
      await this.mqttClient.run(this.recvMqttMessage);
    } catch (e) {
      console.error(e);
    }
  }

  recvMqttMessage = (topic: string, payload: string): void => {
    const topics = topic.split("/");
    const flowId = topics[topics.length - 2];

    if (flowId === this.FlowId) {
      clearTimeout(this.timer);
      this.setConnectStatus(payload);
    }
  }

  setConnectStatus(color: string): void {
    this.connectStatus = color;
    switch (color) {
      case "green":
        this.enableNodeSet = true;
        break;
      case "yellow":
        this.connectIcon = "icon-ts-connection_off";
        this.connectStatus = "red";
        break;
      case "red":
        this.connectIcon = "icon-ts-connection_off";
        break;
    }

    this.$scope.$applyAsync();
  }

  onLoadData({
    id,
    params: {
      FlowId, Host, Port, UnitId, TimeOut, ReTimeOut, AddressNode, InjectWires, Tabledata, PtagList, AddressListCount
    },
    name,
    intervals
  }: any) {
    this.indexID = id;
    this.connName = name;
    this.modbusReadIntervals = intervals;

    this.FlowId = FlowId;

    this.modbusHost = Host;
    this.modbusPort = Port;
    this.modbusUnitID = UnitId;
    this.modbusTimeOut = TimeOut;
    this.modbusReTimeOut = ReTimeOut;
    this.nodeModbusGetteritem = AddressNode;
    this.nodeInjectWiresList = InjectWires;

    this.tableList = Tabledata;
    this.PtagList = PtagList;

    if (AddressListCount > 0) {
      this.editIdx = AddressListCount;
      this.list = (Array.from(this.tableList));
      this.setPageNodes();
      this.$scope.$applyAsync();
    }
  }

  async asyncDataLoader(id: any): Promise<void> {
    try {
      const list = await this.backendSrv.get(`/thingspin/connect/${id}`);
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

  redirect(connid: any) {
    this.$location.path(`/thingspin/manage/data/connect/modbus/${connid}`);
  }

  addAddress() {
    this.orderTable.addRow({});
  }

  //---table 관련
  resetEditData() {
    this.editAddress = "";
    this.editName = "";
    this.editQuantity = "";
    this.editFC = "";
    this.editType = "";
    this.isAddressEditmode = false;
  }

  addTableData2() {
    if (this.isAddressEditmode) {
      const item = this.tableList[this.editIdx - 1];
      item.name = this.editName;
      item.address = this.editAddress;
      item.functioncode = this.editFC;
      item.quantity = this.editQuantity;
      item.datatype = this.editType;
    } else {
      this.editIdx = this.editIdx + 1; // index update
      const tableData: ModbusTableData = {
        idx: this.editIdx,
        name: this.editName,
        address: this.editAddress,
        functioncode: this.editFC,
        quantity: this.editQuantity,
        datatype: this.editType,
      };

      this.tableList.push(tableData);
    }
    this.list = Array.from(this.tableList);

    this.setPageNodes();
    this.$scope.$applyAsync();

    this.isAddressEditView = false;
    this.isAddressEditBtn = true;
    //reset data
    this.resetEditData();
  }

  editPtagList() {
    this.PtagList = [];
    for (const { quantity, name } of this.tableList) {
      if (quantity > 1) {
        for (let i = 0; i < quantity; i++) {
          this.PtagList.push({ name: `${name}_${i}th`, type: '', });
        }
      } else {
        this.PtagList.push({ name: `${name}_0th`, type: '', });
      }
    }
  }

  editAddressList() {
    let editParamFinish = true;
    //check_edit param
    const editIdx = this.editIdx - 1;
    //address check

    let warnMsg = '';
    if (this.editAddress && this.editName) {
      const idx = this.tableList.findIndex(({ address, name }, i) =>
        (this.editAddress === address || this.editName === name)
        && !(this.isAddressEditmode && editIdx === i));

      if (idx >= 0) {
        editParamFinish = false;
        warnMsg = '동일한 name/Address가 존재 합니다.';
      }
    } else {
      editParamFinish = false;
      warnMsg = 'MODBUS 수집 Address를 설정 하세요.';
    }
    // name check

    //check & convert
    const convFuncCode: { [key: string]: string } = {
      'Holding Registers': 'HoldingRegister',
      'Coil Status': 'Coil',
      'Input Status': 'Input',
      'Input Registers': 'InputRegister',
    };
    this.editFC = convFuncCode[this.fcSelected];

    //data type
    this.editType = this.typeSelected;
    this.editQuantity = this.quantitySelected;

    if (editParamFinish) {
      this.addTableData2();
    } else {
      appEvents.emit(AppEvents.alertWarning, [warnMsg]);
    }
  }

  onShowAddressEditView() {
    const b = this.isAddressEditView;
    this.isAddressEditView = !b;
    this.isAddressEditBtn = !!b;

    if (b) {
      this.resetEditData();
    } else {
      this.$timeout(() => {
        $('#address-name').focus();
      });
    }
  }

  showEdit2(idx: any): void {
    const { address, name, quantity, functionicode, datatype } = this.tableList[idx];

    this.editIdx = idx + 1;
    this.editAddress = address;
    this.editName = name;
    this.editQuantity = quantity;
    this.editFC = functionicode;
    this.editType = datatype;

    this.isAddressEditmode = true;
    this.onShowAddressEditView();
  }

  removeEdit2(idx: any): void {
    this.tableList.splice(idx, 1);
    this.list = (Array.from(this.tableList));
    this.setPageNodes();
    this.$scope.$applyAsync();
  }

  //-----------------------------

  //template 관련
  addModbusGETTER(name: any, address: any, quantity: any, functioncode: any, flowid: any, posY: any, interval: any) {
    const objInjector = {
      id: `TS-MODBUS-INJECT-${address}-${flowid}`,
      type: "inject",
      z: "8900476a.91f358",
      name: "",
      topic: "",
      payload: "",
      payloadType: "date",
      repeat: interval,
      crontab: "",
      once: true,
      onceDelay: 0.1,
      x: 110,
      y: 160 + posY,
      wires: [
        [`TS-MODBUS-GETTER-${address}-${flowid}`]
      ]
    };

    const objGetter = {
      id: `TS-MODBUS-GETTER-${address}-${flowid}`,
      type: "modbus-getter",
      z: "8900476a.91f358",
      name: `${address}-Getter`,
      showStatusActivities: false,
      showErrors: false,
      logIOActivities: false,
      unitid: "",
      dataType: functioncode,
      adr: address,
      quantity: quantity,
      server: `TS-MODBUS-SERVER-ID-${flowid}`,
      useIOFile: false,
      ioFile: "",
      useIOForPayload: false,
      x: 340,
      y: 240 + posY,
      wires: [
        [`TS-MODBUS-P-${address}-${flowid}`],
        []
      ]
    };

    const objParser = {
      id: `TS-MODBUS-P-${address}-${flowid}`,
      type: "function",
      z: "8900476a.91f358",
      name: "Parser",
      func: `
var res = { measurement: 'modbus', fields: {} };

for(var i = 0; i < ${quantity}; i += 1) {
  var n = i.toString();
  res.fields['${name}_' + n + 'th'] = msg.payload[i];
}

msg.payload = [res];

return msg;
`,
      outputs: 1,
      noerr: 0,
      x: 510,
      y: 220 + posY,
      wires: [
        [`TS-MODBUS-JOIN-${flowid}`]
      ]
    };

    this.nodeModbusGetteritem += JSON.stringify(objInjector)
      + "," + JSON.stringify(objGetter)
      + "," + JSON.stringify(objParser)
      + ",";
  }

  checkInputData() {
    return !this.connName ? '수집기 이름을 설정 하세요.'
      : !this.modbusHost ? 'HOST IP를 입력 하세요.'
        : !this.modbusPort ? 'PORT 넘버를 입력 하세요.'
          : !this.modbusUnitID ? 'Unit ID를 입력 하세요.'
            : !this.modbusTimeOut ? 'TimeOut을 입력 하세요.'
              : !this.modbusReTimeOut ? 'Re-TimeOut을 입력 하세요.'
                : !this.modbusReadIntervals ? '데이터 수집 주기를 설정 하세요.'
                  : null;
  }

  checkParams() {
    this.isParamsComplete = false;

    const errMsg = this.checkInputData();
    if (errMsg) {
      appEvents.emit(AppEvents.alertWarning, [errMsg]);
    } else {
      this.isParamsComplete = true;
      this.testCreate();
    }
  }

  async testCreate() {
    this.FlowId = uid.generate();
    this.nodeRedFlowName = `MODBUS-${this.connName}`;
    this.nodeModbusGetteritem = "";
    this.nodeInjectWiresList = "";

    if (this.tableList.length > 0) {
      this.editPtagList();

      this.tableList.forEach(({ name, address, quantity, functioncode }, i) => {
        this.addModbusGETTER(name, address, quantity, functioncode, this.FlowId, i * 20, this.modbusReadIntervals);
      });
    } else {
      this.PtagList = [];
    }

    const object = {
      name: this.connName,
      params: {
        FlowId: this.FlowId,
        FlowName: this.nodeRedFlowName,
        AddressListCount: this.tableList.length,
        Intervals: this.modbusReadIntervals,
        Host: this.modbusHost,
        Port: this.modbusPort,
        UnitId: this.modbusUnitID,
        TimeOut: this.modbusTimeOut,
        ReTimeOut: this.modbusReTimeOut,
        AddressNode: this.nodeModbusGetteritem,
        InjectWires: this.nodeInjectWiresList,
        Tabledata: this.tableList,
        influxID: this.modbusinfluxID,
        PtagList: this.PtagList,
        RequestMsg: this.requestHelp,
      },
      intervals: this.modbusReadIntervals
    };

    if (this.isEditMode) {
      await this.backendSrv.put(`/thingspin/connect/${this.indexID}`, object);
    } else if (!this.modbusinfluxID) {
      //upadte connection id for nodered-parser measurement name
      this.modbusinfluxID = await this.backendSrv.post("/thingspin/connect/modbus", object);

      if (!this.isConnCheckMode) {
        object.params.influxID = this.modbusinfluxID;
        //update DB & nodered flow
        await this.backendSrv.put(`/thingspin/connect/${this.modbusinfluxID}`, object);
      }
    } else {
      await this.backendSrv.put(`/thingspin/connect/${this.modbusinfluxID}`, object);
    }

    if (!this.isConnCheckMode) {
      this.close();
    } else {
      this.isConnCheckMode = false;
    }
    this.$scope.$applyAsync();
}

  // table methods
  setPageNodes() {
    const { currPage, rowCount, } = this.tData;
    if (this.list) {
      this.tData.pageNode = this.list.slice(
        currPage * rowCount,
        (currPage * rowCount) + rowCount
      );
    }
  }

  tNextPaging(): void {
    if (this.tData.currPage < this.tData.maxPage) {
      this.tData.currPage += 1;
      this.setPageNodes();
    }
  }

  tPrevPaging(): void {
    if (this.tData.currPage) {
      this.tData.currPage -= 1;
      this.setPageNodes();
    }
  }

  tSetPaging(index: number) {
    this.tData.currPage = index;
    this.tCalcPaging();
    this.setPageNodes();
  }

  tCalcPaging() {
    const { rowCount } = this.tData;
    const temp: number = (this.list.length && (this.list.length % rowCount) === 0) ? 1 : 0;
    this.tData.maxPage = Math.floor(this.list.length / (rowCount)) - temp;
  }

  tGetPagingNumberArray() {
    const { currPage, maxPageLen, maxPage } = this.tData;
    const index = Math.floor(currPage / maxPageLen);

    const from = index * maxPageLen;
    let to = index * maxPageLen + maxPageLen;
    if (to > maxPage) {
      to = maxPage + 1;
    }

    return _.range(from, to);
  }
  // table event methods
  tOnSelectChange() {
    this.tCalcPaging();
    this.setPageNodes();
  }

  //--click input data
  sampleHost() {
    if (!this.modbusHost) {
      this.modbusHost = '127.0.0.1';
    }
  }

  samplePort() {
    if (!this.modbusPort) {
      this.modbusPort = '502';
    }
  }

  sampleUnitID() {
    if (this.modbusUnitID) {
      return;
    } else {
      this.modbusUnitID = 1;
    }
  }

  sampleTimeOut() {
    if (this.modbusTimeOut) {
      return;
    } else {
      this.modbusTimeOut = 1000;
    }
  }

  sampleReTimeOut() {
    if (this.modbusReTimeOut) {
      return;
    } else {
      this.modbusReTimeOut = 2000;
    }
  }

  sampleInterval() {
    if (this.modbusReadIntervals) {
      return;
    } else {
      this.modbusReadIntervals = 1;
    }
  }

  $onInit(): void {
    this.$timeout(() => { $('#collector-input').focus(); });
  }

  onUpload({ name, params, intervals,}: any) {
    if (!(!name || !params || !intervals)) {
      const { Intervals, Host, Port, UnitId, TimeOut, ReTimeOut, AddressNode, InjectWires, Tabledata, AddressListCount } = params;

      this.connName = name;
      this.modbusReadIntervals = Intervals;
      this.modbusHost = Host;
      this.modbusPort = Port;
      this.modbusUnitID = UnitId;
      this.modbusTimeOut = TimeOut;
      this.modbusReTimeOut = ReTimeOut;
      this.nodeModbusGetteritem = AddressNode;
      this.nodeInjectWiresList = InjectWires;
      this.tableList = Tabledata;

      if (AddressListCount > 0) {
        this.editIdx = AddressListCount;
        this.list = Array.from(this.tableList);
        this.setPageNodes();
        this.$scope.$applyAsync();
      }
    }
  }

  exportData() {
    const errMsg = this.checkInputData();
    if (errMsg) {
      appEvents.emit(AppEvents.alertWarning, [errMsg]);
    } else {
      const outputData = {
        name: this.connName,
        params: {
          FlowId: this.FlowId,
          FlowName: this.nodeRedFlowName,
          AddressListCount: this.tableList.length,
          Intervals: this.modbusReadIntervals,
          Host: this.modbusHost,
          Port: this.modbusPort,
          UnitId: this.modbusUnitID,
          TimeOut: this.modbusTimeOut,
          ReTimeOut: this.modbusReTimeOut,
          AddressNode: this.nodeModbusGetteritem,
          InjectWires: this.nodeInjectWiresList,
          Tabledata: this.tableList,
          influxID: this.modbusinfluxID,
          PtagList: this.PtagList,
          RequestMsg: this.requestHelp,
        },
        intervals: this.modbusReadIntervals
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outputData));
      const $elem = $("#downloadAnchorElem");
      $elem.attr("href", dataStr);
      $elem.attr("download", this.connName + "_" + formatDate(new Date()) + ".json");
      $elem.get(0).click();
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
