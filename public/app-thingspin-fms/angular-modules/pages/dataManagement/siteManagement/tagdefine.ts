import angular from "angular";
import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/core';
import $ from 'jquery';
import "./tagdefine.scss";
//import appEvents from 'app/core/app_events';

export class TsTagDefineCtrl {
  static template = require("./tagdefine.html");
  // tree
  source: any;
  dataList: any;
  options: any;
  result: any;
  resultIdx: any;
  // facility
  data: any;
  isShow: boolean;
  isEditView: boolean;
  isEditBtn: boolean;
  facility: any;
  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private $scope: angular.IScope
  ) {
    this.isShow = false;
    this.isEditView = false;
    this.isEditBtn = true;

    this.facility = {
        name: "",
        desc: "",
        lat: "",
        lon: "",
        imgpath: ""
    };
    // right tree info
    this.$scope.$watch('ctrl.data', (newValue: any, oldValue: any) => {
        console.log(newValue);
        console.log(oldValue);
        if (newValue === undefined && oldValue === undefined) {
          this.isShow = false;
        } else {
          this.isShow = true;
        }
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

    // left tree data
    this.backendSrv.get('/thingspin/tagdefine').then((res: any) => {
      console.log("connect data");
      console.log(res);
      this.source = res.Result;
      //this.data = res.Result;
    }).catch((err: any) => {
      console.log("After ordering, error!");
      console.log(err);
    });

    // Tree callback functions : beforeDrop, Dropped
    this.options = {
      beforeDrop: (event) => {
        if (event.source.cloneModel === undefined) {
          // 우측 트리내에서 이동 할 경우
          console.log("This is right tree - before");
          // src Parent
          const fromNode = event.source.nodeScope.node;
          // dst Parent
          const toNode = event.dest.nodesScope.$nodeScope;
          const idx = event.dest.index;
          console.log(fromNode);
          console.log(toNode);
          console.log(idx);
          return true;
        } else {
          console.log("This is left tree");
          const fromNode = event.source.cloneModel;
          const toNode = event.dest.nodesScope.$nodeScope;
          const idx = event.dest.index;
          console.log(fromNode);
          console.log(toNode);
          console.log(idx);
          const postdata = [];
          let curIdx = idx + 1;
          // source node
          fromNode.facility_tree_order = curIdx;
          fromNode.facility_id = toNode.node.facility_id;
          fromNode.site_id = this.data;
          postdata.push(fromNode);
          // target node's child
          for (let i = idx;i < toNode.node.children.length; i++) {
            curIdx = curIdx + 1;
            toNode.node.children[i].facility_tree_order = curIdx;
            //toNode.node.children[i].facility_id = toNode.node.facility_id;
            //toNode.node.children[i].site_id = this.data;
            postdata.push(toNode.node.children[i]);
          }
          console.log(postdata);
          // this must be modified because of timing issue
          const test = {
            "Result" : postdata,
          };
          let exitFlag = true;
          $.ajax({
            type: 'POST',
            url: `/thingspin/sites/`+ this.data + `/facilities/tree`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(test),
            async: false,
            success: (data) => {
              console.log("Post result");
              console.log(data);
              this.result = data;
              this.resultIdx = idx;
            },
            error : (request, status, error ) => {
              exitFlag = false;
              this.resultIdx = -1;
              console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
              },
          });
          console.log("Drag check!");
          console.log(exitFlag);
          return exitFlag;
          /*
          this.backendSrv.post(`/thingspin/sites/`+ this.data + `/facilities/tree`,{
              "Result" : postdata,
            }).then((result) => {
                console.log("Post result");
                this.result = result;
                this.resultIdx = idx;
                //event.dest.nodesScope.$nodeScope.node.children[this.resultIdx] = this.result[0];
                console.log(result);
            }).catch(err => {
              console.log(err);
              this.resultIdx = -1;
            });
            */
        }
      },
      dropped: (event) => {
        const fromNode = event.source.cloneModel;
        if (fromNode === undefined) {
          console.log("This is right tree - after");
        } else {
          console.log("This is left tree - after");
          setTimeout(() => {
            console.log("After dropped!");
            if (this.resultIdx !== -1) {
              console.log(event);
              console.log(event.dest.nodesScope.$nodeScope.node.children[this.resultIdx]);
              event.dest.nodesScope.$nodeScope.node.children[this.resultIdx] = this.result[0];
            }
          },300);
        }
      }
    };
  }

  link(scope, elem, attrs, ctrl) {
      //ctrl.scope = scope;
  }

  $onInit(): void {
      console.log("SiteTable : " + this.data);
      this.isShow = false;
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
