import angular from "angular";
//import appEvents from 'app/core/app_events';

export class TsSiteTableCtrl {
  static template = require("./tagdefine.html");
  source: any;
  data: any;
  options: any;
  /** @ngInject */
  constructor(backendSrv) {
    //appEvents.on('ts-site-change', this.test.bind(this));\
    console.log(backendSrv);
    backendSrv.get('/thingspin/tagdefine').then((res: any) => {
        console.log("connect data");
        console.log(res);
        this.source = res.Result;
      }).catch((err: any) => {
        console.log("After ordering, error!");
        console.log(err);
    });
    this.options = {
        beforeDrop: (event) => {
          const fromNode = event.source.nodeScope.node;
          const toNode = event.dest.nodesScope.$nodeScope;
          console.log(event);
          console.log(fromNode);
          console.log(toNode);
        },
        dropped: (event) => {
            const fromNode = event.source.nodeScope.node;
            //const fromNodeParent = event.source.nodesScope.node;
            //const from = event.source;
            //const to = event.dest;
            const toNode = event.dest.nodesScope.$nodeScope;
            console.log(event);
            console.log(fromNode);
            console.log(toNode);
        }
      };

    this.data = [{
        text: "OPC-UA",
        children: [{
            text: "OPC-UA level - 1",
            children: [{
                text: "OPC-UA level - 2",
                children: [{
                    text: "OPC-UA level - 3",
                    children: [{
                        text: "OPC-UA level - 4"
                    }]
                }]
            }]
        }]
    },{
        text: "MQTT",
        children: [{
            text: "MQTT level - 1",
            children: [{
                text: "MQTT level - 2",
                children: [{
                    text: "MQTT level - 3",
                    children: [{
                        text: "MQTT level - 4"
                    }]
                }]
            }]
        }]
    },{
        text: "Modbus",
        children: [{
            text: "Modbus level - 1",
            children: [{
                text: "Modbus level - 2",
                children: [{
                    text: "Modbus level - 3",
                    children: [{
                        text: "Modbus level - 4"
                    }]
                }]
            }]
        }]
    }];
/*
    this.source = [{
        text: "OPC-UA",
        children: [{
            text: "OPC-UA level - 1",
            children: [{
                text: "OPC-UA level - 2",
                children: [{
                    text: "OPC-UA level - 3",
                    children: [{
                        text: "OPC-UA level - 4"
                    }]
                }]
            }]
        }]
    },{
        text: "MQTT",
        children: [{
            text: "MQTT level - 1",
            children: [{
                text: "MQTT level - 2",
                children: [{
                    text: "MQTT level - 3",
                    children: [{
                        text: "MQTT level - 4"
                    }]
                }]
            }]
        }]
    },{
        text: "Modbus",
        children: [{
            text: "Modbus level - 1",
            children: [{
                text: "Modbus level - 2",
                children: [{
                    text: "Modbus level - 3",
                    children: [{
                        text: "Modbus level - 4"
                    }]
                }]
            }]
        }]
    }];
    */
  }

  test(data) {
      console.log("Emit from parent on test");
      console.log(data);
  }
  link(scope, elem, attrs, ctrl) {
      //ctrl.scope = scope;
  }
}

/** @ngInject */
export function TsTagDefineDirective() {
    return {
      restrict: 'E',
      templateUrl: require("./tagdefine.html"),
      controller: TsSiteTableCtrl,
      bindToController: true,
      controllerAs: 'ctrl',
      scope: {},
    };
  }

angular.module('thingspin.directives').directive('tsTagDefine', TsTagDefineDirective);
