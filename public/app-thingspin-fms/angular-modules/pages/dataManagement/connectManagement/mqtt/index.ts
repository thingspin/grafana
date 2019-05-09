import "./index.scss";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from 'tabulator-tables';
import angular from 'angular';
import { appEvents } from 'app/core/core';

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
  type: string;
  value: string;
  viewStr: string;
}

interface MqttTableData {
  name: string;
  topic: string;
  value: string;
  topicList: Topic[];
}

export class TsMqttConnectCtrl {
  static template: any = require("./index.html");

  connection: any;
  defMqtt: any;
  topicItem: any;
  collector: string;
  valueSelected: string;
  typeSelected: string;
  isTopicEditView: boolean;
  isTopicEditBtn: boolean;
  isEditMode: boolean;

  defTabulatorOpts: object;
  table: any;
  tableList: any;
  indexID: any;
  increaseYPos: any;
  topicListArrayString: string;
  topicDisListArrayString: string;

  /** @ngInject */
  constructor(
    private $scope: angular.IScope,
    private backendSrv: BackendSrv,
    private $location: angular.ILocationService,
    private $compile: angular.ICompileService,
    $routeParams) {
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
      this.increaseYPos = 60;

      this.tableList = new Map<string, MqttTableData>();
      this.isTopicEditView = false;
      this.isTopicEditBtn = true;

      console.log("/thingspin/connect/" + $routeParams.id);
      if ($routeParams.id) {
        console.log("id : " + $routeParams.id);
        this.asyncDataLoader($routeParams.id);
        this.isEditMode = true;
      } else {
        this.isEditMode = false;
      }
  }

  async asyncDataLoader(id): Promise<void> {
    console.log("asyncDataLoader");
    try {
        const list = await this.backendSrv.get("/thingspin/connect/" + id);
        console.log(list);
        this.onLoadData(list);
        this.$scope.$applyAsync();
    } catch (e) {
        console.error(e);
    }
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
      ctrl.scope = scope;
  }

  close() {
    this.$location.path(`/thingspin/manage/data/connect/`);
  }

  save() {
    if (this.collector && this.connection.url && this.connection.port && this.connection.keep_alive) {
      this.onJsonCreatSender();
    } else {
      if (!this.collector) {
        // console.log("수집기 이름을 입력해주세요.");
        this.openAlartNotification("수집기 이름을 입력해주세요.");
      } else if (!this.connection.url) {
        // console.log("HOST를 입력해주세요.");
        this.openAlartNotification("HOST를 입력해주세요.");
      } else if (!this.connection.port) {
        // console.log("PORT를 입력해주세요.");
        this.openAlartNotification("PORT를 입력해주세요.");
      } else if (!this.connection.keep_alive) {
        // console.log("Keep Alive 초를 입력해주세요.");
        this.openAlartNotification("Keep Alive 초를 입력해주세요.");
      }
    }
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

  onShowTopicEditView(value) {
    if (value) {
      this.isTopicEditView = true;
      console.log("value is true");
      this.isTopicEditBtn = false;

      $('#topic-list-input').on('itemRemoved', (event: any) => {
        this.delTopicItemList(event.item);
      });
    } else {
      this.isTopicEditView = false;
      console.log("value is false");
      this.isTopicEditBtn = true;
    }
  }

  initAddressTable() {
    const actionFormatter = (cell: any, formatterParams, onRendered: Function) => {
      const data = cell.getData();
      const $html = this.$compile(/*html*/`
          <button class="btn" ng-click="ctrl.loadTopicData('${data.name}')">
              <i class="fa fa-pencil"></i>
          </button>
          <button class="btn" ng-click="ctrl.removeTopic('${data.name}')">
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
      paginationSize: 20,
      selectable: 1,
      responsivelayout: true,
      layout: "fitColumns",
      columns: [
        {title: "이름",field: "name"},
        {title: "Topic",field: "topic"},
        {title: "Value Type",field: "value"},
        {title: "동작", field: "", formatter: actionFormatter}
      ],
    };


    // const opts = Object.assign({ // deep copy
    //     rowClick: (e, row) => { //trigger an alert message when the row is clicke
    //     },
    // }, this.defTabulatorOpts);
    this.table = new Tabulator("#mqtt-topic-list", this.defTabulatorOpts);
  }

  delTopicItemList(value) {
    const index = this.topicItem.topicList.findIndex(topic => topic.viewStr === value);
    if (index !== -1) {
      this.topicItem.topicList.splice(index, 1);
    }
    console.log(this.topicItem.topicList);
  }

  loadTopicData(value) {
    this.onDataResetTopic();
    if (value) {
      const topicData = this.tableList.get(value);
      this.topicItem.name = topicData.name;
      this.topicItem.topicString = "";
      this.topicItem.value = topicData.value;
      for (let i = 0; i< topicData.topicList.length; i++) {
        const topicItem = {} as Topic;
        topicItem.type = topicData.topicList[i].type;
        topicItem.value = topicData.topicList[i].value;
        topicItem.viewStr = topicData.topicList[i].viewStr;
        this.topicItem.topicList.push(topicItem);
        this.topicItem.topicViewList.push(topicItem.viewStr);
      }
      console.log(this.topicItem);
      this.onShowTopicEditView(true);
    }
  }

  removeTopic(name) {
    console.log(this.tableList);
    this.tableList.delete(name);
    this.table.setData(Array.from(this.tableList.values()));
    console.log(name);
  }

  onLoadData(item) {
    this.indexID = item.id;
    this.collector = item.name;
    const getParams = item.params;
    this.connection.url = getParams.Host;
    this.connection.port = getParams.Port;
    this.connection.keep_alive = getParams.KeepAlive;
    this.connection.session = getParams.Session;
    const getTopicList = getParams.TopicList;
    for (let i = 0; i< getTopicList.length; i++) {
      const tableData = {} as MqttTableData;
      tableData.name = getTopicList[i].name;
      tableData.topic = getTopicList[i].topic;
      tableData.value = getTopicList[i].value;
      tableData.topicList = [];
      for (let j = 0; j < getTopicList[i].topicList.length; j++) {
        const itemTopic = {} as Topic;
        itemTopic.type = getTopicList[i].topicList[j].type;
        itemTopic.value = getTopicList[i].topicList[j].value;
        itemTopic.viewStr = getTopicList[i].topicList[j].viewStr;
        tableData.topicList.push(itemTopic);
      }
      this.tableList.set(tableData.name, tableData);
    }
    this.table.setData(Array.from(this.tableList.values()));
  }

  onDataResetTopic() {
    this.topicItem.name = "";
    this.topicItem.topicString = "";
    this.topicItem.topicList = [];
    this.topicItem.topicViewList = [];
    this.topicItem.item = "";
    this.topicItem.value = this.defMqtt.values[0];
    this.topicItem.selType = this.defMqtt.types[0];
  }

  onTopicAdd(item) {
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
      console.log(this.topicItem);
    } else {
      this.openAlartNotification("토픽 항목을 입력해주세요.");
      // console.log("토픽 항목을 입력해주세요.");
    }
  }

  onTopicListAdd(name) {
    console.log("onTopicListAdd");
    if (name) {
      const tableData = {} as MqttTableData;
      tableData.topicList = [];
      for (let i = 0; i< this.topicItem.topicList.length; i++) {
        if (i === this.topicItem.topicList.length-1) {
          this.topicItem.topicString += this.topicItem.topicList[i].value;
        } else {
          this.topicItem.topicString += this.topicItem.topicList[i].value + "/";
        }
        tableData.topicList.push(this.topicItem.topicList[i]);
      }
      tableData.name = this.topicItem.name;
      tableData.value = this.topicItem.value;
      tableData.topic = this.topicItem.topicString;

      this.tableList.set(tableData.name, tableData);
      this.table.setData(Array.from(this.tableList.values()));
      this.onDataResetTopic();
    } else {
      this.openAlartNotification("토픽 이름을 입력해주세요.");
      // console.log("토픽 이름을 입력해주세요.");
    }
  }

  onJsonCreatSender() {
    let count = 0;
    if (this.tableList.size > 0) {
      this.tableList.forEach((value, key, mapObject) => {
        const topicNode = {
          "id": "TS-MQTT-IN-" + value.name,
          "type": "mqtt in",
          "name": value.name + "::" + value.topic,
          "topic": value.topic,
          "qos": 0,
          "datatype": "auto",
          "broker": "TS-MQTT-CONNECT-"+this.collector,
          "x": 200,
          "y": 100 + (this.increaseYPos * count),
          "wires": [
              [
                  "TS-MQTT-PARSE-" + value.name
              ]
          ]
        };
        const topicParse = {
          "id": "TS-MQTT-PARSE-" + value.name,
          "type": "function",
          "name": value.name + "::" + "Parse",
          // "func": this.onJsonParseWithInfluxCreate(value.name, value.value),
          "func": this.onJsonParseWithInfluxTagCreate(value.name, value.value, value.topic),
          "outputs": 1,
          "noerr": 0,
          "x": 500,
          "y": 100 + (this.increaseYPos * count),
          "wires": [
              [
                  "TS-MQTT-OUTPUT-" + this.collector
              ]
          ]
        };
        const topicDisParse = {
          "id": "TS-MQTT-PARSE-" + value.name,
          "type": "function",
          "name": value.name + "::" + "Parse",
          // "func": this.onJsonParseWithInfluxCreate(value.name, value.value),
          "func": this.onJsonParseWithInfluxTagCreate(value.name, value.value, value.topic),
          "outputs": 1,
          "noerr": 0,
          "x": 500,
          "y": 100 + (this.increaseYPos * count++),
          "wires": [[]]
        };
        if (count === this.tableList.size) {
          this.topicListArrayString += JSON.stringify(topicNode) + ",";
          this.topicListArrayString += JSON.stringify(topicParse);

          this.topicDisListArrayString += JSON.stringify(topicNode) + ",";
          this.topicDisListArrayString += JSON.stringify(topicDisParse);
        } else {
          this.topicListArrayString += JSON.stringify(topicNode) + ",";
          this.topicListArrayString += JSON.stringify(topicParse) + ",";

          this.topicDisListArrayString += JSON.stringify(topicNode) + ",";
          this.topicDisListArrayString += JSON.stringify(topicDisParse) + ",";
        }
      });
      // MQTT Topic array string check
      if (this.topicListArrayString.length !== 0) {
        const object = {
          "name": this.collector,
          "params": {
            "FlowId" : this.collector,
            "Host" : this.connection.url,
            "Port" : this.connection.port,
            "KeepAlive" : this.connection.keep_alive,
            "Session" : this.connection.session,
            "TopicList" : Array.from(this.tableList.values()),
            "AddTopicList": this.topicListArrayString,
            "AddDisTopicList": this.topicDisListArrayString
          }
        };
        if (this.isEditMode) {
          this.backendSrv
          .put("/thingspin/connect/" + this.indexID ,object).then((result: any) => {
            console.log(result);
            this.close();
          })
          .catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
          });
        } else {
          this.backendSrv.post("/thingspin/connect/mqtt",object).then((result: any) => {
            console.log(result);
            this.close();
          })
          .catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
          });
        }
      }
    } else  {
      this.openAlartNotification("수집할 Topic List를 만들어주세요.");
    }
  }

  onJsonParseCreate(value, type) {
    const index = this.defMqtt.values.findIndex((item, index) => {
      return item === type;
    });
    // console.log(index);
    return "const payload = \n{\n  \"" + value + "\" : parse" + this.defMqtt.values[index] + "(msg.payload)\n};\n\nmsg.payload = payload;\n";
  }

  onJsonParseWithInfluxCreate(value, type) {
    const index = this.defMqtt.values.findIndex((item, index) => {
      return item === type;
    });
    const returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.collector + "\",\n    \"fields\": {\n        \""
    + value + "\": parse" + this.defMqtt.values[index] + "(msg.payload)\n    }\n}]\n\nmsg.payload = influxPayload;\n\nreturn msg;\n";
    // console.log(returnValue);
    return returnValue;
  }

  onJsonParseWithInfluxTagCreate(value, type, topic) {
    const index = this.defMqtt.values.findIndex((item, index) => {
      return item === type;
    });
    let returnValue = "";
    if (type === this.defMqtt.values[0]) {
      //String
      returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.collector + "\",\n    \"fields\": {\n        \""
      + value + "\": msg.payload\n},\n    \"tags\": {\n        \"Topic\":\"" + topic + "\"}\n}]\n\nmsg.payload = influxPayload;\n\nreturn msg;\n";
    } else if (type === this.defMqtt.values[3]) {
      //Boolean
      returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.collector + "\",\n    \"fields\": {\n        \""
      + value + "\":" + this.defMqtt.values[index] + "(msg.payload)\n},\n    \"tags\": {\n        \"Topic\":\"" + topic + "\"}\n}]\n\n"
      + "msg.payload = influxPayload;\n\nreturn msg;\n";
    } else {
      returnValue = "var influxPayload = \n[{\n    \"measurement\": \"" + this.collector + "\",\n    \"fields\": {\n        \""
      + value + "\": parse" + this.defMqtt.values[index] + "(msg.payload)\n},\n    \"tags\": {\n        \"Topic\":\"" + topic + "\"}\n}]\n\n"
      + "msg.payload = influxPayload;\n\nreturn msg;\n";
    }
    return returnValue;
  }

  openAlartNotification(value) {
    appEvents.emit('alert-error', [value]);
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
