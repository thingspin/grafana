import angular from "angular";
import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/core';
//import appEvents from 'app/core/app_events';

export class TsSiteTableCtrl {
  static template = require("./tagdefine.html");
  source: any;
  data: any;
  dataList: any;
  options: any;

  isEditView: boolean;
  isEditBtn: boolean;
  facility: any;
  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private $scope: angular.IScope
  ) {
    this.isEditView = false;
    this.isEditBtn = true;

    this.facility = {
        name: "",
        desc: "",
        lat: "",
        lon: "",
        imgpath: ""
    };

    this.$scope.$watch('ctrl.data', (newValue: any, oldValue: any) => {
        console.log(newValue);
        console.log(oldValue);
        this.backendSrv.get(`/thingspin/sites/${newValue}/facilities/tree`,{}).then((result) => {
            this.dataList = [];
            this.dataList = result;
        }).catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
        });
    });

    //appEvents.on('ts-site-change', this.test.bind(this));\
    console.log(this.backendSrv);
    this.backendSrv.get('/thingspin/tagdefine').then((res: any) => {
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

    // this.dataList = [{
    //     text: "OPC-UA",
    //     children: [{
    //         text: "OPC-UA level - 1",
    //         children: [{
    //             text: "OPC-UA level - 2",
    //             children: [{
    //                 text: "OPC-UA level - 3",
    //                 children: [{
    //                     text: "OPC-UA level - 4"
    //                 }]
    //             }]
    //         }]
    //     }]
    // },{
    //     text: "MQTT",
    //     children: [{
    //         text: "MQTT level - 1",
    //         children: [{
    //             text: "MQTT level - 2",
    //             children: [{
    //                 text: "MQTT level - 3",
    //                 children: [{
    //                     text: "MQTT level - 4"
    //                 }]
    //             }]
    //         }]
    //     }]
    // },{
    //     text: "Modbus",
    //     children: [{
    //         text: "Modbus level - 1",
    //         children: [{
    //             text: "Modbus level - 2",
    //             children: [{
    //                 text: "Modbus level - 3",
    //                 children: [{
    //                     text: "Modbus level - 4"
    //                 }]
    //             }]
    //         }]
    //     }]
    // }];
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

    $onInit(): void {
        console.log("SiteTable : " + this.data);
    }

    onShowEditView(value) {
      if (value) {
          this.isEditView = true;
          this.isEditBtn = false;
        } else {
            this.isEditView = false;
            this.isEditBtn = true;
        }
    }

    deleteTreeItem() {
        console.log("deleteTreeItem");
    }

    onFacilityAdd() {
        this.backendSrv.post(`thingspin/sites/${this.data}/facilities`,
        {
            "SiteId": this.data,
            "Name": this.facility.name,
            "Desc": this.facility.desc,
            "Lat": parseFloat(this.facility.lat),
            "Lon": parseFloat(this.facility.lon),
            "Imgpath": this.facility.imgpath
        }).then((result) => {
            // this.onLoadData(result);
            console.log(result);
            this.dataList = result;
        }).catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
        });
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
      scope: {
        data: "="
      },
    };
  }

angular.module('thingspin.directives').directive('tsTagDefine', TsTagDefineDirective);
