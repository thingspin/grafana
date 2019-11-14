// JS 3rd party libs
import _ from "lodash";
import angular, { ITimeoutService } from 'angular';
const uid = require("shortid");

// Grafana libs
import { CoreEvents } from 'app/types';
import { dateTime, AppEvents } from '@grafana/data';
import { appEvents } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import TsMqttController from 'app-thingspin-fms/utils/mqttController';

const DEF_URL = "localhost";
const DEF_PORT = "1883";
const DEF_ALIVE = "60";
const DEF_TOPIC_TYPE_STRING = "String";
const DEF_TOPIC_TYPE_SHARP = "#";
const DEF_TOPIC_TYPE_PLUS = "+";
// const DEF_TOPIC_SEPARATOR = "/";
// const DEF_TOPIC_SPACE = " ";

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


interface TopicItem {
  id: number;
  name: string;
  topic: string;
  topicList: any[];
  topicViewList: any[];
  topicString: string;
  item: string;
  value: string;
  selType: string;
}

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

export class TsMqttConnectCtrl implements angular.IController {
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
  topicItem: TopicItem = {
    id: 0,
    name: '',
    topic: '',
    topicList: [] as any[],
    topicViewList: [] as any[],
    topicString: '',
    item: '',
    value: this.defMqtt.values[0],
    selType: this.defMqtt.types[0]
  };
  collector = '';
  uuid: string;
  FlowID: string;
  valueSelected: string;
  typeSelected: string;
  isTopicEditView = false;
  isTopicEditBtn = true;
  isEditMode = !!this.$routeParams.id;
  isTopicEditMode = false;
  isLoadTopic = '';
  connectStatus: string;

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
    private $routeParams: angular.route.IRouteParamsService,
    private $timeout: ITimeoutService) {
    this.initMqtt();

    if ($routeParams.id) {
      this.asyncDataLoader($routeParams.id);
    } else {
      this.uuid = uid.generate();
    }
  }

  async asyncDataLoader(id: any): Promise<void> {
    try {
      const list = await this.backendSrv.get(`/thingspin/connect/${id}`);

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

  $onDestroy(): void {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
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
    const errMsg = (!this.collector) ? "수집기 이름을 입력해주세요."
      : (!this.connection.url) ? "HOST를 입력해주세요."
        : (!this.connection.port) ? "PORT를 입력해주세요."
          : (!this.connection.keep_alive) ? "Keep Alive 초를 입력해주세요."
            : '';

    if (errMsg) {
      this.openAlartNotification(errMsg);
    }

    return !errMsg;
  }

  connectTest() {
    if (this.inputChecker()) {
      if (this.indexID === -1 || this.tableList.size === 0) {
        if (!this.topicDisListArrayString) {
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
    this.isTopicEditView = !!value;
    this.isTopicEditBtn = !value;

    if (value) {
      if (!this.topicItem.name && !this.topicItem.topicString) {
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
    }
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

  /*
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
  */

  findCompareTopicName(name: any) {
    const keys = this.tableList.keys();

    for (const key of keys) {
      const { type } = this.tableList.get(key); // topic alias
      const convType = type.toLowerCase();

      if (convType !== name.toLowerCase()
        || (this.isTopicEditMode && convType === this.isLoadTopic.toLowerCase())) { // edit mode check
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
          // call by reference(?)
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
      } else if (!this.topicItem.topicList.length) {
        this.openAlartNotification("토픽 항목을 입력해주세요.");
      }
    }
  }

  onJsonCreatSender(withclose: any) {
    if (!this.topicListArrayString && !this.topicDisListArrayString) {
      this.createConnectNode();
    }

    if (this.tableList.size > 0) {
      this.topicListArrayString += ",";
      this.topicDisListArrayString += ",";
      this.topicListPublishArrayString += ",";

      let count = 0;
      this.tableList.forEach(({ type, id, viewStr, value }: any) => {
        const topicNode = {
          id: `TS-MQTT-IN-${type}_${id}`,
          type: "mqtt in",
          name: `${type}_${id}::${viewStr}`,
          topic: viewStr,
          qos: 0,
          datatype: "auto",
          broker: `TS-MQTT-CONNECT-${this.uuid}`,
          x: 200,
          y: 300 + (this.increaseYPos * count),
          wires: [
            [
              `TS-MQTT-PARSE-${type}_${id}`
            ]
          ]
        };
        const topicParse = {
          id: `TS-MQTT-PARSE-${type}_${id}`,
          type: "function",
          name: `${type}_${id}::Parse`,
          func: this.onJsonParseWithInfluxTagCreate(type, value, viewStr),
          outputs: 1,
          noerr: 0,
          x: 500,
          y: 300 + (this.increaseYPos * count),
          wires: [
            [
              `TS-CONV-INFLUXDB-PAYLOAD-FUNC-ID-${this.uuid}`
            ]
          ]
        };
        const topicPublishParse = {
          id: `TS-MQTT-PARSE-${type}_${id}`,
          type: "function",
          name: `${type}_${id}::Parse`,
          func: this.onJsonParseWithInfluxTagCreate(type, value, viewStr),
          outputs: 1,
          noerr: 0,
          x: 500,
          y: 300 + (this.increaseYPos * count),
          wires: [
            [
              "TS-CONV-INFLUXDB-PAYLOAD-FUNC-ID-" + this.uuid,
              "TS-CONV-MQTT-PAYLOAD-FUNC-ID-" + this.uuid
            ]
          ]
        };
        const topicDisParse: any = {
          id: `TS-MQTT-PARSE-${type}_${id}`,
          type: "function",
          name: `${type}_${id}::Parse`,
          func: this.onJsonParseWithInfluxTagCreate(type, value, viewStr),
          outputs: 1,
          noerr: 0,
          x: 500,
          y: 300 + (this.increaseYPos * count),
          wires: [[]]
        };

        this.topicListPublishArrayString += JSON.stringify(topicNode) + "," + JSON.stringify(topicPublishParse);
        this.topicListArrayString += JSON.stringify(topicNode) + "," + JSON.stringify(topicParse);
        this.topicDisListArrayString += JSON.stringify(topicNode) + "," + JSON.stringify(topicDisParse);

        count += 1;
        if (count !== this.tableList.size) {
          this.topicListPublishArrayString += ",";
          this.topicListArrayString += ",";
          this.topicDisListArrayString += ",";
        }
      });

      if (this.topicListArrayString.length) {
        this.methodProcess(this.createHttpObject(), withclose);
      }
    } else if (withclose && this.topicListArrayString.length) {
      this.methodProcess(this.createHttpObject(), withclose);
    }
  }

  onJsonParseWithInfluxTagCreate(key: any, type: any, topic: any) {
    const { values } = this.defMqtt;
    const index = values.findIndex((item: any, _index: any) => item === type);

    const value = (type === values[0]) ? `msg.payload` //String
      : (type === values[3]) ? `parse${values[index]}(msg.payload)` // Boolean
        : `parse${values[index]}(msg.payload)`;

    return `
msg.id = ${this.indexID};
msg.payload = { "${key}": ${value} };

return msg;
`;
  }

  makePtagList() {
    this.PtagList = [];
    this.tableList.forEach(({ type, value }: any) => {
      this.PtagList.push({
        name: type,
        type: value,
      });
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

    return {
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
  }

  openAlartNotification(value: any) {
    appEvents.emit(AppEvents.alertError, [value]);
  }

  setConnectStatus(color: string): void {
    this.connectStatus = color;
    const colorCls: { [key: string]: any } = {
      green: { state: 'mqtt-state-connected', btn: 'icon-ts-power', },
      yellow: { state: 'mqtt-state-retry', btn: 'icon-ts-connection-loding', },
      red: { state: 'mqtt-state-disconnect', btn: 'icon-ts-connection_off', },
      init: { state: 'mqtt-state-retry', btn: 'icon-ts-power', },
      default: { state: 'mqtt-state-retry', btn: 'icon-ts-power', },
    };
    const $btn = $('#mqtt-connect-btn');
    const $state = $('#mqtt-connect-state');

    for (const c in colorCls) {
      const { state, btn } = colorCls[c];

      $btn.removeClass(btn);
      $state.removeClass(state);
    }

    if (!colorCls[color]) {
      color = 'default';
    }

    $state.addClass(colorCls[color].state);
    $btn.addClass(colorCls[color].btn);

    this.$scope.$applyAsync();
  }

  // CASE BY SEND HTTP (PUT, POST)
  // VALUE IS "TRUE" >> CLOSE FUNCTION
  async methodProcess(object: any, value: any): Promise<any> {
    try {
      if (!(this.isEditMode || this.indexID !== -1)) {
        this.indexID = await this.backendSrv.post("/thingspin/connect/mqtt", object);
      }
      await this.backendSrv.put(`/thingspin/connect/${this.indexID}`, object);
      this.updateData();
      if (value) {
        this.close();
      }
    } catch (err) {
      if (err.status === 500) {
        appEvents.emit(AppEvents.alertError, [err.statusText]);
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

  onUpload({ collector, connection, topicList }: any) {
    if (!(!collector || !connection || !topicList)) {
      appEvents.emit(CoreEvents.showConfirmModal, {
        title: 'Import 방식',
        text2: `Import 된 내용을 Overwrite 하시겠습니까?`,
        icon: 'fa-trash',
        yesText: "Overwrite",
        altActionText: 'Add on',
        onAltAction: async () => {
          try {
            // this.nodes = this.nodes.concat(dash.params.nodes);
            topicList.forEach(({ name: n, type, viewStr, topic, value }: any, id: number) => {
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
          } catch (e) {
            console.error(e);
          }
        },
        onConfirm: async () => {
          this.collector = collector;
          this.connection = {
            url: connection.url,
            port: connection.port,
            keep_alive: connection.keep_alive,
            session: connection.session,
          };
          this.tableList.clear();
          this.list = [];
          this.initTable();

          topicList.forEach(({ name: n, type, viewStr, topic, value }: any, id: number) => {
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
        },
      });
    }
  }

  exportData() {
    const outputData = JSON.stringify({
      collector: this.collector,
      connection: this.connection,
      topicList: Array.from(this.tableList.values())
    });

    const $elem = $("#downloadAnchorElem");
    $elem.attr("href", "data:text/json;charset=utf-8," + encodeURIComponent(outputData));
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
