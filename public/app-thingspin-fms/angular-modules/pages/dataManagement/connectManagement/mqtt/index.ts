import _ from "lodash";
import "./index.scss";
import { BackendSrv } from 'app/core/services/backend_srv';
import angular, { ITimeoutService } from 'angular';
import { appEvents } from 'app/core/core';
const uid = require("shortid");

import TsMqttController from 'app-thingspin-fms/utils/mqttController';

const DEF_URL = "localhost";
const DEF_PORT = "1883";
const DEF_ALIVE = "60";
// const DEF_TOPIC = "/#";
const DEF_TOPIC_TYPE_STRING = "String";
const DEF_TOPIC_TYPE_SHARP = "#";
const DEF_TOPIC_TYPE_PLUS = "+";
const DEF_TOPIC_SEPARATOR = "/";
const DEF_TOPIC_SPACE = " ";

interface Topic {
  id: number;
  type: string;
  value: string;
  viewStr: string;
}

interface TagList {
  name: any;
  type: any;
}

// interface MqttTableData {
//   name: string;
//   topic: string;
//   value: string;
//   topicList: Topic[];
// }

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

export class TsMqttConnectCtrl {
  static template: any = require("./index.html");

  connection: any;
  defMqtt: any;
  topicItem: any;
  collector: string;
  uuid: string;
  FlowID: string;
  valueSelected: string;
  typeSelected: string;
  isTopicEditView: boolean;
  isTopicEditBtn: boolean;
  isEditMode: boolean;
  connectStatus: string;

  defTabulatorOpts: object;
  table: any;
  tableList: any;
  indexID: any;
  increaseYPos: any;
  topicListArrayString: string;
  topicDisListArrayString: string;
  topicListPublishArrayString: string;
  PtagList: any[];

  timeout: any;
  // MQTT
  readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
  readonly listenerTopic: string = "/thingspin/connect/+/status" as string;
  readonly connectTimeout: number = 15000;
  private readonly nodeRedHost: string = `/api/cep` as string;
  mqttClient: TsMqttController; // mqtt client instance
  timer: NodeJS.Timer | null;

  list: Topic[];
  tData: TableModel = {
    rowCount: 10,
    selectOpts: [10, 20, 30],
    currPage: 0,
    maxPage: 0,
    maxPageLen: 10,
    pageNode: [],
  };

  /** @ngInject */
  constructor(
    private $scope: angular.IScope,
    private backendSrv: BackendSrv,
    private $location: angular.ILocationService,
    private $compile: angular.ICompileService,
    $routeParams: angular.route.IRouteParamsService,
    $timeout: ITimeoutService) {
    this.timeout = $timeout;
    this.connection = {
      url: DEF_URL,
      port: DEF_PORT,
      keep_alive: DEF_ALIVE,
      session: true
    };
    this.defMqtt = {
      values: ['String', 'Int', 'Float', 'Boolean'],
      types: [DEF_TOPIC_TYPE_STRING, DEF_TOPIC_TYPE_SHARP, DEF_TOPIC_TYPE_PLUS]
    };
    this.collector = "";
    this.topicItem = {
      id: 0,
      name: "",
      topicList: [],
      topicViewList: [],
      topicString: "",
      item: "",
      value: this.defMqtt.values[0],
      selType: this.defMqtt.types[0]
    };
    this.topicListArrayString = "";
    this.topicDisListArrayString = "";
    this.topicListPublishArrayString = "";
    this.increaseYPos = 60;
    this.indexID = -1;
    // this.tableList = new Map<string, MqttTableData>();
    this.tableList = new Map<number, Topic>();
    this.isTopicEditView = false;
    this.isTopicEditBtn = true;

    this.initMqtt();
    if ($routeParams.id) {
      // console.log("id : " + $routeParams.id);
      this.asyncDataLoader($routeParams.id);
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
      this.uuid = uid.generate();
    }
  }

  async asyncDataLoader(id: any): Promise<void> {
    // console.log("asyncDataLoader");
    try {
      const list = await this.backendSrv.get("/thingspin/connect/" + id);
      // console.log(list);
      this.onLoadData(list);
      this.$scope.$applyAsync();
    } catch (e) {
      console.error(e);
    }
  }

  async initMqtt(): Promise<void> {
    // console.log(this.mqttUrl);
    // console.log(this.listenerTopic);
    this.mqttClient = new TsMqttController(this.mqttUrl, this.listenerTopic);

    try {
      await this.mqttClient.run(this.recvMqttMessage.bind(this));
      console.log("MQTT Connected");
    } catch (e) {
      console.error(e);
    }
  }

  recvMqttMessage(topic: string, payload: string): void {
    const topics = topic.split("/");
    const flowId = topics[topics.length - 2];
    // console.log(topic);
    // console.log(payload);
    if (flowId === this.uuid) {
      clearTimeout(this.timer);
      this.setConnectStatus(payload);
    }
  }

  $onInit(): void {
    this.timeout(() => {
      $('#collector_input').focus();
    });
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
    ctrl.scope = scope;
  }

  close() {
    this.$location.path(`/thingspin/manage/data/connect/`);
  }

  save(value: boolean) {
    if (value) {
      if (this.collector && this.connection.url && this.connection.port && this.connection.keep_alive) {
        this.onJsonCreatSender(true);
      } else {
        if (!this.collector) {
          this.openAlartNotification("수집기 이름을 입력해주세요.");
          return;
        } else if (!this.connection.url) {
          this.openAlartNotification("HOST를 입력해주세요.");
          return;
        } else if (!this.connection.port) {
          this.openAlartNotification("PORT를 입력해주세요.");
          return;
        } else if (!this.connection.keep_alive) {
          this.openAlartNotification("Keep Alive 초를 입력해주세요.");
          return;
        }
      }
    } else {
      if (!this.collector) {
        this.openAlartNotification("수집기 이름을 입력해주세요.");
        return;
      } else if (!this.connection.url) {
        this.openAlartNotification("HOST를 입력해주세요.");
        return;
      } else if (!this.connection.port) {
        this.openAlartNotification("PORT를 입력해주세요.");
        return;
      } else if (!this.connection.keep_alive) {
        this.openAlartNotification("Keep Alive 초를 입력해주세요.");
        return;
      }
      if (this.indexID === -1 || this.tableList.size === 0) {
        if (this.topicDisListArrayString.length === 0) {
          this.createConnectNode();
        }
        this.methodProcess(this.createHttpObject(), false);
      } else {
        if (value) {
          this.onJsonCreatSender(value);
        }
      }
    }
  }

  onShowTopicEditView(value: any) {
    if (value) {
      this.isTopicEditView = true;
      // console.log("value is true");
      this.isTopicEditBtn = false;
      if (this.topicItem.name.length === 0 && this.topicItem.topicString.length === 0) {
        this.topicItem.id = this.tableList.size;
      }
      /* --jwpark 19.07.04
      $('#topic-list-input').on('itemRemoved', (event: any) => {
        this.delTopicItemList(event.item);
      });
      */
    } else {
      this.onDataResetTopic();
      this.isTopicEditView = false;
      // console.log("value is false");
      this.isTopicEditBtn = true;
    }
  }

  initAddressTable() {
    const actionFormatter = (cell: any, _formatterParams: any, onRendered: Function) => {
      const data = cell.getData();
      const $html = this.$compile(/*html*/`
          <button class="btn" ng-click="ctrl.loadTopicData('${data.id}')">
              <i class="fa fa-pencil"></i>
          </button>
          <button class="btn" ng-click="ctrl.removeTopic('${data.id}')">
              <i class="fa fa-trash"></i>
          </button>
      `)(this.$scope);
      onRendered((): void => {
        this.$scope.$applyAsync();
        $(cell.getElement()).append($html);
      });
    };
    this.defTabulatorOpts = {
      pagination: "local",
      paginationSize: 10,
      responsivelayout: true,
      layout: "fitColumns",
      layoutColumnsOnNewData: true,
      columns: [
        { title: "이름", field: "name" },
        { title: "Topic", field: "topic" },
        { title: "Value Type", field: "value" },
        { title: "동작", field: "", formatter: actionFormatter }
      ],
    };
    // this.table = new Tabulator("#mqtt-topic-list", this.defTabulatorOpts);
  }

  delTopicItemList(value: any) {
    const index = this.topicItem.topicList.findIndex((topic: any) => topic.viewStr === value);
    if (index !== -1) {
      this.topicItem.topicList.splice(index, 1);
    }
    // console.log(this.topicItem.topicList);
  }

  loadTopicData(value: any) {
    this.onDataResetTopic();
    const topicData = this.tableList.get(value);
    this.topicItem.id = topicData.id;
    this.topicItem.name = topicData.type;
    this.topicItem.topicString = topicData.viewStr;
    this.topicItem.value = topicData.value;
    // for (let i = 0; i< topicData.topicList.length; i++) {
    //   const topicItem = {} as Topic;
    //   topicItem.type = topicData.topicList[i].type;
    //   topicItem.value = topicData.topicList[i].value;
    //   topicItem.viewStr = topicData.topicList[i].viewStr;
    //   this.topicItem.topicList.push(topicItem);
    //   this.topicItem.topicViewList.push(topicItem.viewStr);
    // }
    // console.log(this.topicItem);
    this.onShowTopicEditView(true);
  }

  removeTopic(name: any) {
    // console.log(this.tableList);
    this.tableList.delete(name);
    this.list = (Array.from(this.tableList.values()));
    this.setPageNodes();
    this.$scope.$applyAsync();
    // console.log(this.list);
  }

  onLoadData(item: any) {
    // console.log("item:" + item);
    this.indexID = item.id;
    this.collector = item.name;
    const getParams = item.params;
    this.FlowID = getParams.FlowId;
    this.uuid = getParams.UUID;
    this.connection.url = getParams.Host;
    this.connection.port = getParams.Port;
    this.connection.keep_alive = getParams.KeepAlive;
    this.connection.session = getParams.Session;
    this.PtagList = getParams.PtagList;
    const getTopicList = getParams.TopicList;
    for (let i = 0; i < getTopicList.length; i++) {
      // const tableData = {} as MqttTableData;
      const tableData = {} as Topic;
      tableData.id = i;
      if (getTopicList[i].type === undefined || getTopicList[i].type === null) {
        tableData.type = getTopicList[i].name;
      } else {
        tableData.type = getTopicList[i].type;
      }
      if (getTopicList[i].viewStr === undefined || getTopicList[i].viewStr === null) {
        tableData.viewStr = getTopicList[i].topic;
      } else {
        tableData.viewStr = getTopicList[i].viewStr;
      }
      tableData.value = getTopicList[i].value;
      // tableData.topicList = [];
      /*--jwpark 19.07.04
      for (let j = 0; j < getTopicList[i].topicList.length; j++) {
        const itemTopic = {} as Topic;
        itemTopic.type = getTopicList[i].topicList[j].type;
        itemTopic.value = getTopicList[i].topicList[j].value;
        itemTopic.viewStr = getTopicList[i].topicList[j].viewStr;
        tableData.topicList.push(itemTopic);
      }
      */
      this.tableList.set(tableData.id, tableData);
      if (this.list === undefined) {
        this.list = [];
      }
      this.list.push(tableData);
    }
    this.initTable();
    // this.table.setData(Array.from(this.tableList.values()));
  }

  onDataResetTopic() {
    this.topicItem.id = 0;
    this.topicItem.name = "";
    this.topicItem.topic = "";
    this.topicItem.topicString = "";
    this.topicItem.topicList = [];
    this.topicItem.topicViewList = [];
    this.topicItem.item = "";
    this.topicItem.value = this.defMqtt.values[0];
    this.topicItem.selType = this.defMqtt.types[0];
  }

  onTopicAdd(item: any) {
    if (item) {
      const itemTopic = {} as Topic;
      if (this.topicItem.selType === DEF_TOPIC_TYPE_STRING) {
        itemTopic.type = DEF_TOPIC_TYPE_STRING;
        itemTopic.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      } else if (this.topicItem.selType === DEF_TOPIC_TYPE_SHARP) {
        itemTopic.type = DEF_TOPIC_TYPE_SHARP;
        itemTopic.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_TYPE_SHARP + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      } else if (this.topicItem.selType === DEF_TOPIC_TYPE_PLUS) {
        itemTopic.type = DEF_TOPIC_TYPE_PLUS;
        itemTopic.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_TYPE_PLUS + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      }
      itemTopic.value = item;
      this.topicItem.topicList.push(itemTopic);
      this.topicItem.topicViewList.push(itemTopic.viewStr);
      // console.log(this.topicItem);
      //++jwpark 19.07.04
      this.topicItem.topic = item;
    } else {
      this.openAlartNotification("토픽 항목을 입력해주세요.");
    }
  }

  onTopicListAdd(name: any) {
    // console.log("onTopicListAdd");
    if (name !== -1 && this.topicItem.topicString.length > 0) {
      const inputData = this.tableList.get(name);
      if (inputData === null || inputData === undefined) {
        const tableData = {} as Topic;
        tableData.id = this.tableList.size;
        tableData.type = this.topicItem.name;
        tableData.value = this.topicItem.value;
        tableData.viewStr = this.topicItem.topicString;
        this.tableList.set(tableData.id, tableData);
      } else {
        inputData.type = this.topicItem.name;
        inputData.value = this.topicItem.value;
        inputData.viewStr = this.topicItem.topicString;
        this.tableList.set(inputData.id, inputData);
      }
      // if (name && this.topicItem.topicList.length > 0) {
      // const tableData = {} as MqttTableData;
      // tableData.topicList = [];
      /* --jwpark 19.07.04
      for (let i = 0; i< this.topicItem.topicList.length; i++) {
        if (i === this.topicItem.topicList.length-1) {
          this.topicItem.topicString += this.topicItem.topicList[i].value;
        } else {
          this.topicItem.topicString += this.topicItem.topicList[i].value + "/";
        }
        tableData.topicList.push(this.topicItem.topicList[i]);
      } */
      // this.table.setData(Array.from(this.tableList.values()));
      this.list = Array.from(this.tableList.values());
      // console.log(this.list);
      this.onDataResetTopic();
      this.setPageNodes();
      this.$scope.$applyAsync();
      this.onShowTopicEditView(false);
    } else {
      if (!name) {
        this.openAlartNotification("토픽 이름을 입력해주세요.");
      } else if (this.topicItem.topicList.length === 0) {
        this.openAlartNotification("토픽 항목을 입력해주세요.");
      }
    }
  }

  onJsonCreatSender(withclose: any) {
    let count = 0;
    if (this.topicListArrayString.length === 0 &&
      this.topicDisListArrayString.length === 0) {
      this.createConnectNode();

      if (this.topicListArrayString.length !== 0 && this.indexID > 0 && this.tableList.size === 0) {
        this.methodProcess(this.createHttpObject(), withclose);
        return;
      }
    }
    if (this.tableList.size > 0) {
      this.topicListArrayString += ",";
      this.topicDisListArrayString += ",";
      this.topicListPublishArrayString += ",";

      this.tableList.forEach((value: any, key: any, mapObject: any) => {
        const topicNode = {
          "id": "TS-MQTT-IN-" + value.type + "_" + value.id,
          "type": "mqtt in",
          "name": value.type + "_" + value.id + "::" + value.viewStr,
          "topic": value.viewStr,
          "qos": 0,
          "datatype": "auto",
          "broker": "TS-MQTT-CONNECT-" + this.uuid,
          "x": 200,
          "y": 300 + (this.increaseYPos * count),
          "wires": [
            [
              "TS-MQTT-PARSE-" + value.type + "_" + value.id
            ]
          ]
        };
        const topicParse = {
          "id": "TS-MQTT-PARSE-" + value.type + "_" + value.id,
          "type": "function",
          "name": value.type + "_" + value.id + "::" + "Parse",
          // "func": this.onJsonParseWithInfluxCreate(value.name, value.value),
          "func": this.onJsonParseWithInfluxTagCreate(value.type, value.value, value.viewStr),
          "outputs": 1,
          "noerr": 0,
          "x": 500,
          "y": 300 + (this.increaseYPos * count),
          "wires": [
            [
              "TS-CONV-INFLUXDB-PAYLOAD-FUNC-ID-" + this.uuid
            ]
          ]
        };
        const topicPublishParse = {
          "id": "TS-MQTT-PARSE-" + value.type + "_" + value.id,
          "type": "function",
          "name": value.type + "_" + value.id + "::" + "Parse",
          // "func": this.onJsonParseWithInfluxCreate(value.name, value.value),
          "func": this.onJsonParseWithInfluxTagCreate(value.type, value.value, value.viewStr),
          "outputs": 1,
          "noerr": 0,
          "x": 500,
          "y": 300 + (this.increaseYPos * count),
          "wires": [
            [
              "TS-CONV-INFLUXDB-PAYLOAD-FUNC-ID-" + this.uuid,
              "TS-CONV-MQTT-PAYLOAD-FUNC-ID-" + this.uuid
            ]
          ]
        };
        const topicDisParse: any = {
          id: "TS-MQTT-PARSE-" + value.type + "_" + value.id,
          type: "function",
          name: value.type + "_" + value.id + "::" + "Parse",
          // "func": this.onJsonParseWithInfluxCreate(value.name, value.value),
          func: this.onJsonParseWithInfluxTagCreate(value.type, value.value, value.viewStr),
          outputs: 1,
          noerr: 0,
          x: 500,
          y: 300 + (this.increaseYPos * count++),
          wires: [[]]
        };

        if (count === this.tableList.size) {
          this.topicListPublishArrayString += JSON.stringify(topicNode) + ",";
          this.topicListPublishArrayString += JSON.stringify(topicPublishParse);

          this.topicListArrayString += JSON.stringify(topicNode) + ",";
          this.topicListArrayString += JSON.stringify(topicParse);

          this.topicDisListArrayString += JSON.stringify(topicNode) + ",";
          this.topicDisListArrayString += JSON.stringify(topicDisParse);
        } else {
          this.topicListPublishArrayString += JSON.stringify(topicNode) + ",";
          this.topicListPublishArrayString += JSON.stringify(topicPublishParse) + ",";

          this.topicListArrayString += JSON.stringify(topicNode) + ",";
          this.topicListArrayString += JSON.stringify(topicParse) + ",";

          this.topicDisListArrayString += JSON.stringify(topicNode) + ",";
          this.topicDisListArrayString += JSON.stringify(topicDisParse) + ",";
        }
      });

      if (this.topicListArrayString.length !== 0) {
        this.methodProcess(this.createHttpObject(), withclose);
      }
    } else {
      if (withclose) {
        if (this.topicListArrayString.length !== 0) {
          this.methodProcess(this.createHttpObject(), withclose);
        }
        this.close();
      }
    }
  }

  onJsonParseCreate(value: any, type: any) {
    const index = this.defMqtt.values.findIndex((item: any, _index: any) => item === type);
    // console.log(index);
    return "const payload = \n{\n  \"" + value + "\" : parse" + this.defMqtt.values[index] + "(msg.payload)\n};\n\nmsg.payload = payload;\n";
  }

  onJsonParseWithInfluxCreate(value: any, type: any) {
    const index = this.defMqtt.values.findIndex((item: any, _index: any) => item === type);
    const returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.indexID + "\",\n    \"fields\": {\n        \""
      + value + "\": parse" + this.defMqtt.values[index] + "(msg.payload)\n    }\n}]\n\nmsg.payload = influxPayload;\n\nreturn msg;\n";
    // console.log(returnValue);
    return returnValue;
  }

  onJsonParseWithInfluxTagCreate(value: any, type: any, topic: any) {
    const index = this.defMqtt.values.findIndex((item: any, _index: any) => item === type);
    let returnValue = "";
    if (type === this.defMqtt.values[0]) {
      //String
      returnValue = "var influxPayload = {\n    \"" + value + "\": msg.payload\n\}\n\nmsg.payload = influxPayload;\n\n"
        + "msg.id = " + this.indexID + "\;\n\nreturn msg;\n";
    } else if (type === this.defMqtt.values[3]) {
      //Boolean
      returnValue = "var influxPayload = {\n    \"" + value + "\":parse" + this.defMqtt.values[index] +
        "(msg.payload)\n\}\n\nmsg.payload = influxPayload;\n\n" + "msg.id = " + this.indexID + "\;\n\nreturn msg;\n";

    } else {
      returnValue = "var influxPayload = {\n    \"" + value + "\":parse" + this.defMqtt.values[index] +
        "(msg.payload)\n\}\n\nmsg.payload = influxPayload;\n\n" + "msg.id = " + this.indexID + "\;\n\nreturn msg;\n";
    }
    // console.log("String:" + returnValue);
    return returnValue;
  }

  makePtagList() {
    this.PtagList = [];
    this.tableList.forEach((value: any, key: any, mapObject: any) => {
      const TagData = {} as TagList;
      TagData.name = value.type;
      TagData.type = value.value;
      this.PtagList.push(TagData);
    });
    // console.log(this.PtagList);
  }
  createConnectNode() {
    const connectNode: any = {
      id: "TS-MQTT-CHECKNODE-" + this.uuid,
      type: "mqtt out",
      name: this.uuid,
      topic: "#",
      qos: "0",
      datatype: "auto",
      broker: "TS-MQTT-CONNECT-" + this.uuid,
      x: 810,
      y: 100,
      wires: [[]]
    };
    this.topicListArrayString += JSON.stringify(connectNode);
    this.topicDisListArrayString += JSON.stringify(connectNode);
    this.topicListPublishArrayString += JSON.stringify(connectNode);
  }

  // Generate OBJECT to send over HTTP Parameter
  createHttpObject() {
    this.makePtagList();
    const data = {
      "name": this.collector,
      "params": {
        "Name": this.collector,
        "FlowId": this.uuid,
        "UUID": this.uuid,
        "Host": this.connection.url,
        "Port": this.connection.port,
        "KeepAlive": this.connection.keep_alive,
        "Session": this.connection.session,
        "TopicList": Array.from(this.tableList.values()),
        "AddTopicList": this.topicListArrayString,
        "AddDisTopicList": this.topicDisListArrayString,
        "publishTopicList": this.topicListPublishArrayString,
        "PtagList": this.PtagList
      }
    };
    return data;
  }

  openAlartNotification(value: any) {
    appEvents.emit('alert-error', [value]);
  }

  setConnectStatus(color: string): void {
    this.connectStatus = color;
    $('#mqtt-connect-btn').removeClass('icon-ts-connection_off');
    $('#mqtt-connect-btn').removeClass('icon-ts-connection-loding');
    $('#mqtt-connect-btn').removeClass('icon-ts-power');
    $('#mqtt-connect-state').removeClass('mqtt-state-connected');
    $('#mqtt-connect-state').removeClass('mqtt-state-retry');
    $('#mqtt-connect-state').removeClass('mqtt-state-disconnect');
    if (color === "green") {
      $('#mqtt-connect-state').addClass('mqtt-state-connected');
      $('#mqtt-connect-btn').addClass('icon-ts-power');
    } else if (color === "yellow") {
      $('#mqtt-connect-state').addClass('mqtt-state-retry');
      $('#mqtt-connect-btn').addClass('icon-ts-connection-loding');
    } else if (color === "red") {
      $('#mqtt-connect-state').addClass('mqtt-state-disconnect');
      $('#mqtt-connect-btn').addClass('icon-ts-connection_off');
    } else if (color === "init") {
      $('#mqtt-connect-state').addClass('mqtt-state-retry');
      $('#mqtt-connect-btn').addClass('icon-ts-power');
    }
    this.$scope.$applyAsync();
  }

  // CASE BY SEND HTTP (PUT, POST)
  // VALUE IS "TRUE" >> CLOSE FUNCTION
  methodProcess(object: any, value: any) {
    // console.log(object);
    if (this.isEditMode) {
      this.backendSrv
        .put("/thingspin/connect/" + this.indexID, object).then((result: any) => {
          // console.log(result);
          this.backendSrv.get(`${this.nodeRedHost}/mqtt/${this.uuid}/status`).then((result: any) => {
            // console.log(result);
            if (value) {
              this.close();
            }
          })
            .catch((err: any) => {
              if (err.status === 500) {
                appEvents.emit('alert-error', [err.statusText]);
              }
            });
        })
        .catch((err: any) => {
          if (err.status === 500) {
            appEvents.emit('alert-error', [err.statusText]);
          }
        });
    } else {
      if (this.indexID !== -1) {
        // console.log(object);
        this.backendSrv
          .put("/thingspin/connect/" + this.indexID, object).then((result: any) => {
            // console.log(result);
            this.backendSrv.get(`${this.nodeRedHost}/mqtt/${this.uuid}/status`).then((result: any) => {
              // console.log(result);
              if (value) {
                this.close();
              }
            })
              .catch((err: any) => {
                if (err.status === 500) {
                  appEvents.emit('alert-error', [err.statusText]);
                }
              });
          })
          .catch((err: any) => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
          });
      } else {
        this.backendSrv.post("/thingspin/connect/mqtt", object).then((result: any) => {
          // console.log(result);
          this.indexID = result;
          this.topicListArrayString = "";
          this.topicDisListArrayString = "";
          this.topicListPublishArrayString = "";
          this.onJsonCreatSender(value);
        })
          .catch((err: any) => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
          });
      }
    }
  }

  // TABLE Method
  initTable(): void {
    this.$scope.$watch("list", () => {
      this.setPageNodes();
    });
  }
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
