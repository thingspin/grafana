import angular from "angular";
import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/core';
//import appEvents from 'app/core/app_events';

export class TsTagDefineCtrl {
  static template = require("./tagdefine.html");
  // tree
  source: any;
  dataList: any;
  options: any;
  checkedMap: any;
  prevMap: any;
  // facility
  data: any;
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
          if (result !== null || result !== undefined) {
            this.dataList = [];
            this.dataList = result;
          }
        }).catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
        });
    });

    this.options = {
        beforeDrop: (event) => {
        const fromNode = event.source.cloneModel;
        const toNode = event.dest.nodesScope.$nodeScope;
        const idx = event.dest.index;
          if (fromNode === undefined) {
            // 우측 트리 이동
          } else {
            // 좌측 -> 우측 복제
              if ( this.checkedMap.size === 0 ) {
                console.log("Map empty");
                return false;
              }
              this.prevMap = new Map(this.checkedMap);
              const postdata = [];
              if (!fromNode.ischecked) {
                  console.log("Not selected");
                  return false;
              }
              //let exitFlag = false;
              console.log(fromNode);
              console.log(toNode);
              //toNode.node.tag_name = "zzz";
              const newChildren = [];
              let cnt = 1;
              // toNode에서 facility id 얻어서 업데이트
              for (let i = 0;i < idx; i++) {
                console.log("new child");
                console.log(toNode.node.children[i]);
                toNode.node.children[i].facility_tree_order = cnt;
                cnt = cnt + 1;
                newChildren.push(toNode.node.children[i]);
                postdata.push(toNode.node.children[i]);
              }
              this.checkedMap.delete(fromNode.facility_tree_order);
              fromNode.facility_tree_order = cnt;
              cnt = cnt + 1;
              postdata.push(fromNode);
              for (const [key, value] of this.checkedMap.entries()) {
                value.facility_id = toNode.node.facility_id;
                value.facility_tree_order = cnt;
                cnt = cnt + 1;
                console.log("new child");
                console.log(value);
                newChildren.push(value);
                postdata.push(value);
                console.log(key);
              }
              //console.log("==================zz");
              //console.log(toNode.node.children);
              //console.log(toNode.node.children[1]);
              for (let i = idx;i<toNode.node.children.length;i++) {
                  console.log("new child");
                  console.log(toNode.node.children[i]);
                  toNode.node.children[i].facility_tree_order = cnt;
                  cnt = cnt + 1;
                  newChildren.push(toNode.node.children[i]);
              }
              toNode.node.children = newChildren;
          }
/*
          for (const value of this.checkedMap.values()) {

            console.log(value);
          }
          backendSrv.post('/thingspin/menu/'+fid,newData).then((res: any) => {
            toNode.$modelValue.facility_id
          }).catch((err: any) => {
            console.log("After ordering, error!");
            console.log(err);
          });
          */
         return true;
        },
        dropped: (event) => {
            this.checkedMap = this.prevMap;
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
  }

  checked(node) {
    console.log(node);
    if (node.ischecked) {
        // 제거
        if ( node.children != null && node.children.length) {
          for ( let i = 0; i < node.children.length; i++) {
              node.children[i].ischecked = false;
              this.checkedMap.delete(node.children[i].facility_tree_order);
            }
            node.ischecked = false;
        } else {
          node.ischecked = false;
          this.checkedMap.delete(node.facility_tree_order);
        }
    } else {
        // 추가
        if ( node.children != null && node.children.length) {
          for ( let i = 0; i < node.children.length; i++) {
              node.children[i].ischecked = true;
              this.checkedMap.set(node.children[i].facility_tree_order,node.children[i]);
          }
        } else {
          node.ischecked = true;
          this.checkedMap.set(node.facility_tree_order,node);
        }
    }

    for (const value of this.checkedMap.values()) {
      console.log(value);
    }
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
      controller: TsTagDefineCtrl,
      bindToController: true,
      controllerAs: 'ctrl',
      scope: {
        data: "="
      },
    };
  }

angular.module('thingspin.directives').directive('tsTagDefine', TsTagDefineDirective);
