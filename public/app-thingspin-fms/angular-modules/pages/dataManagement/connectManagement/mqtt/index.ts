import angular from 'angular';
import "./index.scss";
import { BackendSrv } from 'app/core/services/backend_srv';
import Tabulator from 'tabulator-tables';

const DEF_URL = "localhost";
const DEF_PORT = "1884";
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

  defTabulatorOpts: object;
  table: any;
  tableList: any;


  /** @ngInject */
  constructor(private backendSrv: BackendSrv) {
    this.connection = {
       url: DEF_URL,
       port: DEF_PORT,
       keep_alive: DEF_ALIVE,
       session: true
    };
    this.defMqtt = {
      values: ['String', 'Integer', 'Float', 'Boolean'],
      types: [DEF_TOPIC_TYPE_STRING, DEF_TOPIC_TYPE_SHARP, DEF_TOPIC_TYPE_PLUS]
    };
    this.collector = "";
    this.topicItem = {
      name: "",
      topicList: [],
      topicViewList: [],
      topicString: "",
      value: this.defMqtt.values[0],
      item: "",
      selType: this.defMqtt.types[0]
    };
    this.defTabulatorOpts = {
      pagination: "local",
      paginationSize: 20,
      selectable: 1,
      responsivelayout: true,
      height: "200px",
      layout: "fitColumns",
      columns: [
        {title: "이름",field: "name"},
        {title: "Topic",field: "topic"},
        {title: "Value Type",field: "value"},
        {title: "동작", field: ""}
      ],
    };
    this.tableList = [];
    this.isTopicEditView = false;
    this.isTopicEditBtn = true;
  }

  link(scope: any, elem: any, attrs: any, ctrl: { scope: any; }) {
      ctrl.scope = scope;
  }

  close() {
    console.log("close");
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

  onShowTopicEditView() {
    console.log("function called");
    if (this.isTopicEditView) {
      this.isTopicEditView = false;
      console.log("value is false");
      this.isTopicEditBtn = true;
    }else {
      this.isTopicEditView = true;
      console.log("value is true");
      this.isTopicEditBtn = false;
    }
    $('#topic-list-input').on('itemRemoved', (event: any) => {
      this.delTopicItemList(event.item);
    });
  }

  initAddressTable() {
    const opts = Object.assign({ // deep copy
        rowClick: (e, row) => { //trigger an alert message when the row is clicke
        },
    }, this.defTabulatorOpts);
    this.table = new Tabulator("#mqtt-topic-list",opts);
  }

  delTopicItemList(value) {
    const index = this.topicItem.topicList.findIndex(topic => topic.viewStr === value);
    this.topicItem.topicList.splice(index, 1);
    console.log(this.topicItem.topicList);
  }

  onMakeTopicList() {

  }

  onDataResetTopic() {
    this.topicItem.name = "";
    this.topicItem.topicString = "";
    this.topicItem.topicList = [];
    this.topicItem.topicViewList = [];
  }

  onTopicAdd(item) {
    if (item) {
      const topicItem = {} as Topic;
      if (this.topicItem.selType === DEF_TOPIC_TYPE_STRING) {
        topicItem.type = DEF_TOPIC_TYPE_STRING;
        topicItem.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      } else if (this.topicItem.selType === DEF_TOPIC_TYPE_SHARP) {
        topicItem.type = DEF_TOPIC_TYPE_SHARP;
        topicItem.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_TYPE_SHARP + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      } else if (this.topicItem.selType === DEF_TOPIC_TYPE_PLUS) {
        topicItem.type = DEF_TOPIC_TYPE_PLUS;
        topicItem.viewStr = item + DEF_TOPIC_SPACE + DEF_TOPIC_TYPE_PLUS + DEF_TOPIC_SPACE + DEF_TOPIC_SEPARATOR;
      }
      topicItem.value = item;
      this.topicItem.topicList.push(topicItem);
      this.topicItem.topicViewList.push(topicItem.viewStr);
      console.log(this.topicItem);
    } else {
      console.log("토픽 항목을 입력해주세요.");
    }
  }

  onTopicListAdd(name) {
    console.log("onTopicListAdd");
    if (name) {
      for (let i = 0; i< this.topicItem.topicList.length; i++) {
        if (i === this.topicItem.topicList.length-1) {
          this.topicItem.topicString += this.topicItem.topicList[i].value;
        } else {
          this.topicItem.topicString += this.topicItem.topicList[i].value + "/";
        }
      }

      const tableData = {
        name : name,
        topic : this.topicItem.topicString,
        value : this.topicItem.value,
        topicList : this.topicItem.topicList
      };
      this.tableList.push(tableData);

      this.table.setData(this.tableList);
      this.onDataResetTopic();
    } else {
      console.log("토픽 이름을 입력해주세요.");
    }
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
