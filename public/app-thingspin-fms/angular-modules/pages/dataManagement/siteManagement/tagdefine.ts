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
  // isShow: boolean;
  isEditView: boolean;
  isEditBtn: boolean;
  facility: any;
  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private $scope: angular.IScope,
    private $location: angular.ILocationService,
    $routeParams
  ) {
    // this.isShow = false;
    this.isEditView = false;
    this.isEditBtn = true;

    this.facility = {
        name: "",
        desc: "",
        lat: "",
        lon: "",
        imgpath: ""
    };

    if ($routeParams.id !== undefined || $routeParams.id !== null) {
      this.data = +$routeParams.id;

      this.backendSrv.get(`/thingspin/sites/${$routeParams.id}/facilities/tree`,{}).then((result)=> {
        if (result !== null || result !== undefined) {
          this.dataList = [];
          this.dataList = result;
        } else {
          this.dataList = [];
        }
      }).catch(err => {
        if (err.status === 500) {
          appEvents.emit('alert-error', [err.statusText]);
        }
      });
    }

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
        const postData = [];
        if (event.source.cloneModel === undefined) {
          // 우측 트리내에서 이동 할 경우
          console.log("This is right tree - before");
          console.log(event);

          if (event.dest.nodesScope.$nodeScope === null) {
            // 설비가 Lv1 로 이동하는 경우
            if (event.source.nodesScope.$nodeScope !== null) {
              console.log("From >= lv2, to == Lv1 ");
              // Src 순서 변경
              for ( let _i = event.source.index + 1, _j = event.source.index; _i < event.source.nodesScope.$modelValue.length; _i++,_j++) {
                event.source.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.source.nodesScope.$modelValue[_i]);
              }
              // Dst 내용 변경
              event.source.nodesScope.$modelValue[event.source.index].value = "0";
              event.source.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

              postData.push(event.source.nodesScope.$modelValue[event.source.index]);
              // Dst 순서 변경
              for ( let _i = event.dest.index, _j = event.dest.index + 1; _i < event.dest.nodesScope.$modelValue.length; _i++, _j++) {
                event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.dest.nodesScope.$modelValue[_i]);
              }
            } else {
              // Lv1 설비 사이의 이동
              if ( event.source.index < event.dest.index ) {
                console.log("From Lv1 up -> to Lv1 down");
                // 위에서 아래로 이동할 때
                event.dest.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

                postData.push(event.dest.nodesScope.$modelValue[event.source.index]);
                // 이동 후 순서 변경
                for (let _j = event.source.index, _i = _j + 1; _i <= event.dest.index; _i++,_j++) {
                  event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                  postData.push(event.dest.nodesScope.$modelValue[_i]);
                }
              } else {
                console.log("From Lv1 down -> to Lv1 up");
                event.dest.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

                postData.push(event.dest.nodesScope.$modelValue[event.source.index]);
                for ( let _j = event.dest.index + 1, _i = event.dest.index; _i < event.source.index; _i++,_j++) {
                  event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                  postData.push(event.dest.nodesScope.$modelValue[_i]);
                }
              }
            }
          }else {
            console.log("From >= lv1 , to >= lv2 : normal case");
            // src Parent
            const from = event.source;
            const to = event.dest;
            const fromNode = event.source.nodeScope.$modelValue;
            //const fromNodeParent = event.source.nodeScope.$nodeScope.$modelValue;
            // dst Parent
            const toNode = event.dest.nodesScope.$nodeScope;
            const toNodeParent = toNode.$modelValue;
            //const idx = event.dest.index;
            if (fromNode.facility_id === toNode.node.facility_id) {
                  if ( from.index < to.index ) {
                    console.log("Same Level : Up -> down");
                    toNodeParent.children[from.index].facility_tree_order = to.index + 1;

                    postData.push(toNodeParent.children[from.index]);
                    // 이동후 순서 변경
                    for (let _j = from.index, _i = _j + 1; _i <= to.index; _i++,_j++) {
                      toNodeParent.children[_i].facility_tree_order = _j + 1;

                      postData.push(toNodeParent.children[_i]);
                    }
                  } else {
                    console.log("Same Level : Down -> up");
                    toNodeParent.children[from.index].facility_tree_order = to.index + 1;

                    postData.push(toNodeParent.children[from.index]);
                    // 이동후 순서 변경
                    for ( let _j = to.index + 1, _i = to.index; _i < from.index; _i++,_j++) {
                      toNodeParent.children[_i].facility_tree_order = _j + 1;

                      postData.push(toNodeParent.children[_i]);
                    }
                  }
            } else {
              // 다른 레벨
              console.log("diff level");
              // Src 순서 변경
              for ( let _i = event.source.index + 1, _j = event.source.index; _i < event.source.nodesScope.$modelValue.length; _i++,_j++) {
                event.source.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.source.nodesScope.$modelValue[_i]);
              }
              // 부모정보 변경
              event.source.nodesScope.$modelValue[event.source.index].value = toNodeParent.facility_id.toString();
              event.source.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

              postData.push(event.source.nodesScope.$modelValue[event.source.index]);
              // Dst 순서 변경
              for ( let _i = to.index, _j = to.index + 1; _i < toNodeParent.children.length; _i++, _j++) {
                toNodeParent.children[_i].facility_tree_order = _j + 1;

                postData.push(toNodeParent.children[_i]);
              }
            }
          }
          // Update ! 이동은 정보 업데이트할 필요없으므로 response : true or false
          const test = {
            "Result" : postData,
          };
          let result = true;
          console.log("Post before");
          console.log(postData);
          $.ajax({
            type: 'PUT',
            url: `/thingspin/sites/`+ this.data + `/facilities/tree`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(test),
            async: false,
            success: (data) => {
              console.log("Post result");
              console.log(data);
            },
            error : (request, status, error ) => {
              console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
              result = false;
            },
          });
          return result;
        } else {
          console.log("This is left tree");
          console.log(event);
          const fromNode = event.source.cloneModel;
          const toNode = event.dest.nodesScope.$nodeScope;
          const idx = event.dest.index;
          if (toNode.node === null || (fromNode.facility_id === 0 && toNode === null)) {
            console.log("against rules!");
            return false;
          }
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
          console.log("Post before");
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
              //onsole.log(event);
              //console.log(event.dest.nodesScope.$nodeScope.node.children[this.resultIdx]);
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

  async asyncDataLoader(id): Promise<void> {
    console.log("asyncDataLoader");
    try {
        const result = await this.backendSrv.get(`/thingspin/sites/${id}/facilities/tree`);
        if (result !== null || result !== undefined) {
          this.dataList = [];
          this.dataList = result;
        }
        this.$scope.$applyAsync();
    } catch (e) {
        console.error(e);
    }
  }

  $onInit(): void {
      // console.log("SiteTable : " + this.data);
      // this.isShow = false;
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

  backtosite() {
    this.$location.path(`/thingspin/manage/data/site`);
  }

  deleteTreeItem() {
      console.log("deleteTreeItem");
  }

  onFacilityAdd() {
    this.onShowEditView(false);
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
      scope: {},
    };
  }

angular.module('thingspin.directives').directive('tsTagDefine', TsTagDefineDirective);
