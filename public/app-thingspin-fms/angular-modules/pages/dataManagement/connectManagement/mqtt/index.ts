// JS 3rd party libs
import _ from "lodash";
import angular, { ITimeoutService } from 'angular';
const uid = require("shortid");
import "./index.scss";

// Grafana libs
import { dateTime } from '@grafana/data';
import { appEvents } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
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

// const DEF_REQUEST_MESSAGE_CONNECT = "접속 테스트 시도";

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

export function formatDate(date: Date): string {
  return dateTime(date).format('YYYY-MM-DD_HH:mm:ss');
}

export class TsMqttConnectCtrl {
  static template: any = require("./index.html");

  connection = {
    url: '',
    port: '',
    keep_alive: '',
    session: true
  };
  defMqtt = {
    values: ['String', 'Int', 'Float', 'Boolean'],
    types: [DEF_TOPIC_TYPE_STRING, DEF_TOPIC_TYPE_SHARP, DEF_TOPIC_TYPE_PLUS]
  };
  topicItem: any;
  collector = '';
  uuid: string;
  FlowID: string;
  valueSelected: string;
  typeSelected: string;
  isTopicEditView = false;
  isTopicEditBtn = true;
  isEditMode: boolean;
  isTopicEditMode = false;
  isLoadTopic = '';
  connectStatus: string;

  defTabulatorOpts: object;
  tableList = new Map<number, Topic>();
  indexID = -1;
  increaseYPos = 60;
  topicListArrayString = '';
  topicDisListArrayString = '';
  topicListPublishArrayString = '';
  PtagList: TagList[];
  requestHelp: string;

  // MQTT
  readonly mqttUrl: string = `ws://${this.$location.host()}:${this.$location.port()}/thingspin-proxy/mqtt` as string;
  readonly listenerTopic: string = "/thingspin/connect/+/status" as string;
  readonly connectTimeout: number = 15000;
  private readonly nodeRedHost: string = `/api/cep` as string;
  mqttClient: TsMqttController; // mqtt client instance
  timer: NodeJS.Timer | null;

  list: Topic[] = [];
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
    private $timeout: ITimeoutService) {
    this.topicItem = {
      id: 0,
      name: '',
      topicList: [],
      topicViewList: [],
      topicString: '',
      item: '',
      value: this.defMqtt.values[0],
      selType: this.defMqtt.types[0]
    };

    this.initMqtt();
    if ($routeParams.id) {
      this.asyncDataLoader($routeParams.id);
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
      this.uuid = uid.generate();
    }
  }

  async asyncDataLoader(id: any): Promise<void> {
    try {
      const list = await this.backendSrv.get("/thingspin/connect/" + id);

      this.onLoadData(list);
      this.updateData();
      this.$scope.$applyAsync();
    } catch (e) {
      console.error(e);
    }
  }

  async initMqtt(): Promise<void> {
    this.mqttClient = new TsMqttController(this.mqttUrl, this.listenerTopic);

    try {
      await this.mqttClient.run(this.recvMqttMessage.bind(this));
    } catch (e) {
      console.error(e);
    }
  }

  sampleHost() {
    if (this.connection.url.length === 0) {
      this.connection.url = DEF_URL;
    }
  }

  samplePort() {
    if (this.connection.port.length === 0) {
      this.connection.port = DEF_PORT;
    }
  }

  sampleKeep() {
    if (this.connection.keep_alive.length === 0) {
      this.connection.keep_alive = DEF_ALIVE;
    }
  }

  async updateData() {
    try {
      const result = await this.backendSrv.get(`${this.nodeRedHost}/mqtt/${this.uuid}/status`);

      this.setConnectStatus(result);
    } catch (e) {
      console.error(e);
    }
  }

  recvMqttMessage(topic: string, payload: string): void {
    const topics = topic.split("/");
    const flowId = topics[topics.length - 2];

    if (flowId === this.uuid) {
      clearTimeout(this.timer);
      this.setConnectStatus(payload);
    }
  }

  $onInit(): void {
    this.$timeout(() => {
      $('#collector_input').focus();
    });
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
    ctrl.scope = scope;
  }

  close() {
    this.$timeout(() => {
      this.$location.path(`/thingspin/manage/data/connect/`);
    });
  }

  inputChecker() {
    if (!this.collector) {
      this.openAlartNotification("수집기 이름을 입력해주세요.");
      return false;
    } else if (!this.connection.url) {
      this.openAlartNotification("HOST를 입력해주세요.");
      return false;
    } else if (!this.connection.port) {
      this.openAlartNotification("PORT를 입력해주세요.");
      return false;
    } else if (!this.connection.keep_alive) {
      this.openAlartNotification("Keep Alive 초를 입력해주세요.");
      return false;
    }
    return true;
  }

  connectTest() {
    if (this.inputChecker()) {
      if (this.indexID === -1 || this.tableList.size === 0) {
        if (this.topicDisListArrayString.length === 0) {
          this.createConnectNode();
        }
        this.methodProcess(this.createHttpObject(), false);
      }
    }
  }

  save(value: boolean) {
    if (this.inputChecker()) {
      this.onJsonCreatSender(true);
    }
  }

  onShowTopicEditView(value: any) {
    if (value) {
      this.isTopicEditView = true;
      this.isTopicEditBtn = false;
      if (this.topicItem.name.length === 0 && this.topicItem.topicString.length === 0) {
        this.topicItem.id = this.tableList.size;
      }
      /* --jwpark 19.07.04
      $('#topic-list-input').on('itemRemoved', (event: any) => {
        this.delTopicItemList(event.item);
      });
      */
      this.$timeout(() => {
        $('#topic_name').focus();
      });
    } else {
      this.onDataResetTopic();
      this.isTopicEditView = false;
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
  }

  delTopicItemList(value: any) {
    const index = this.topicItem.topicList.findIndex((topic: any) => topic.viewStr === value);
    if (index !== -1) {
      this.topicItem.topicList.splice(index, 1);
    }
  }

  loadTopicData(data: any) {
    this.onDataResetTopic();
    const { id, type, viewStr, value } = this.tableList.get(data);

    this.topicItem.id = id;
    this.topicItem.name = type;
    this.topicItem.topicString = viewStr;
    this.topicItem.value = value;
    this.isTopicEditMode = true;
    this.isLoadTopic = type;
    this.onShowTopicEditView(true);
  }

  removeTopic(name: any) {
    this.tableList.delete(name);
    this.list = (Array.from(this.tableList.values()));
    this.setPageNodes();
    this.$scope.$applyAsync();
  }

  onLoadData({ id, name, params }: any) {
    const { FlowId, UUID, Host, Port, KeepAlive, Session, PtagList, TopicList } = params;

    this.indexID = id;
    this.collector = name;
    this.FlowID = FlowId;
    this.uuid = UUID;
    this.connection = {
      url: Host,
      port: Port,
      keep_alive: KeepAlive,
      session: Session,
    };
    this.PtagList = PtagList;

    TopicList.forEach(({ name: n, type, viewStr, topic, value }: any, id: number) => {
      const tableData: Topic = {
        id,
        type: type ? type : n,
        viewStr: viewStr ? viewStr : topic,
        value,
      };

      this.tableList.set(id, tableData);
      this.list.push(tableData);
    });

    this.initTable();
  }

  onDataResetTopic() {
    const { values: [value], types: [selType] } = this.defMqtt;

    this.topicItem = Object.assign(this.topicItem, {
      id: 0,
      name: '',
      topic: '',
      topicString: '',
      topicList: [],
      topicViewList: [],
      item: '',
      value,
      selType,
    });
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
      //++jwpark 19.07.04
      this.topicItem.topic = item;
    } else {
      this.openAlartNotification("토픽 항목을 입력해주세요.");
    }
  }

  findCompareTopicName(name: any) {
    const keys = Array.from(this.tableList.keys());

    for (const key of keys) {
      const convType = JSON.stringify(this.tableList.get(key).type.toLowerCase());

      if (convType !== JSON.stringify(name.toLowerCase())) {
        continue;
      }

      if (this.isTopicEditMode && (convType === JSON.stringify(this.isLoadTopic.toLowerCase()))) {
        continue;
      }

      this.openAlartNotification("Topic 이름이 같은 항목이 있습니다. 다른 이름을 입력해주세요.");
      return false;
    }
    return true;
  }

  onTopicListAdd(n: any) {
    if (n !== -1 && this.topicItem.topicString.length > 0) {
      const inputData = this.tableList.get(n);
      const { name, value, topicString } = this.topicItem;

      if (this.findCompareTopicName(name)) {
        let id, data;
        if (!inputData) {
          id = this.tableList.size;
          data = {
            id,
            type: name,
            value,
            viewStr: topicString
          };
        } else {
          inputData.type = name;
          inputData.value = value;
          inputData.viewStr = topicString;

          id = inputData.id;
          data = inputData;

          this.isTopicEditMode = false;
        }

        this.tableList.set(id, data);
        this.onDataResetTopic();
        this.onShowTopicEditView(false);
      }
      this.list = Array.from(this.tableList.values());
      this.setPageNodes();
      this.$scope.$applyAsync();
    } else {
      if (!n) {
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
      }
    }
  }

  onJsonParseCreate(value: any, type: any) {
    const index = this.defMqtt.values.findIndex((item: any, _index: any) => item === type);
    return "const payload = \n{\n  \"" + value + "\" : parse" + this.defMqtt.values[index] + "(msg.payload)\n};\n\nmsg.payload = payload;\n";
  }

  onJsonParseWithInfluxCreate(value: any, type: any) {
    const index = this.defMqtt.values.findIndex((item: any, _index: any) => item === type);
    const returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.indexID + "\",\n    \"fields\": {\n        \""
      + value + "\": parse" + this.defMqtt.values[index] + "(msg.payload)\n    }\n}]\n\nmsg.payload = influxPayload;\n\nreturn msg;\n";
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
    return returnValue;
  }

  makePtagList() {
    this.PtagList = [];
    this.tableList.forEach(({ type, value }: any) => {
      const TagData = {
        name: type,
        type: value,
      };
      this.PtagList.push(TagData);
    });
  }

  createConnectNode() {
    const connectNode: any = {
      id: "TS-MQTT-CHECKNODE-" + this.uuid,
      type: "mqtt out",
      name: "connect",
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
    const { url, port, keep_alive, session } = this.connection;
    const data = {
      name: this.collector,
      params: {
        Name: this.collector,
        FlowId: this.uuid,
        UUID: this.uuid,
        Host: url,
        Port: port,
        KeepAlive: keep_alive,
        Session: session,
        TopicList: Array.from(this.tableList.values()),
        AddTopicList: this.topicListArrayString,
        AddDisTopicList: this.topicDisListArrayString,
        publishTopicList: this.topicListPublishArrayString,
        PtagList: this.PtagList,
        RequestMsg: this.requestHelp,
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
    } else {
      $('#mqtt-connect-state').addClass('mqtt-state-retry');
      $('#mqtt-connect-btn').addClass('icon-ts-power');
    }
    this.$scope.$applyAsync();
  }

  // CASE BY SEND HTTP (PUT, POST)
  // VALUE IS "TRUE" >> CLOSE FUNCTION
  async methodProcess(object: any, value: any): Promise<any> {
    try {
      if (this.isEditMode || this.indexID !== -1) {
        await this.backendSrv.put("/thingspin/connect/" + this.indexID, object);
      } else {
        const result = await this.backendSrv.post("/thingspin/connect/mqtt", object);
        this.indexID = result;
        await this.backendSrv.put("/thingspin/connect/" + this.indexID, object);
      }
      if (value) {
        this.close();
      }
    } catch (err) {
      if (err.status === 500) {
        appEvents.emit('alert-error', [err.statusText]);
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

  onUpload(dash: any) {
    if (this.jsonDataParsingChecker(dash)) {
      this.collector = dash.collector;
      this.connection = {
        url: dash.connection.url,
        port: dash.connection.port,
        keep_alive: dash.connection.keep_alive,
        session: dash.connection.session,
      };

      dash.topicList.forEach(({ name: n, type, viewStr, topic, value }: any, id: number) => {
        const tableData: Topic = {
          id,
          type: type ? type : n,
          viewStr: viewStr ? viewStr : topic,
          value,
        };
        this.tableList.set(id, tableData);
        this.list.push(tableData);
      });
      this.initTable();
    }
  }

  jsonDataParsingChecker({collector, connection, topicList}: any) {
      return !(!collector || !connection || !topicList);
  }

  async exportData() {
    const outputData = {
      collector: this.collector,
      connection: this.connection,
      topicList: Array.from(this.tableList.values())
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(outputData));
    const $elem = $("#downloadAnchorElem");
    $elem.attr("href", dataStr);
    $elem.attr("download", this.collector + "_" + formatDate(new Date()) + ".json");
    $elem.get(0).click();
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
