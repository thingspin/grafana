// js 3rd party libs
import $ from 'jquery';
import angular, { IWindowService, ITimeoutService } from "angular";

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import "./tagdefine.scss";

export class TsTagDefineCtrl {
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
  isEdit: boolean;
  isTitleEditView: boolean;
  isTitleView: boolean;
  facility: any;
  editDataBackup: string;
  window: any;
  timeout: any;
  inputForm: any;
  siteInfo: any;

  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private $scope: angular.IScope,
    private $location: angular.ILocationService,
    $routeParams: angular.route.IRouteParamsService,
    $window: IWindowService,
    $timeout: ITimeoutService,
  ) {
    this.timeout = $timeout;
    // this.isShow = false;
    this.isEditView = false;
    this.isEditBtn = true;
    this.isEdit = false;
    this.isTitleEditView = false;
    this.isTitleView = true;
    this.facility = {
      name: "",
      desc: "",
      lat: "",
      lon: "",
      imgpath: "",
      tagName: "",
    };
    this.siteInfo = {
      name: "",
      desc: ""
    };
    this.editDataBackup = "";
    this.window = angular.element($window);
    this.inputForm = null;

    $scope.$watch('ctrl.isEditView', (value) => {
      if (value) {
        $timeout(() => {
          $('#facility-name').focus();
        });
      }
    });

    this.window.bind('resize', () => {
      const total = $('#ts-tag-define-title-left-content').width();
      const calcResult = (total / 2) - 44.719;
      if (calcResult < 248) {
        $('#title-info-right-view').css('display', 'none');
      } else {
        $('#title-info-right-view').css('display', 'inline-flex');
      }
      $('#ts-define-tree-title-left').css('padding-left', (total / 2) - 44.719);
    });


    if ($routeParams.id !== undefined || $routeParams.id !== null) {
      this.data = +$routeParams.id;
      backendSrv.get(`/thingspin/sites/${$routeParams.id}`, {}).then((result: any) => {
        console.log(result);
        if (result !== null || result !== undefined) {
          this.siteInfo.name = result.name;
          this.siteInfo.desc = result.desc;
        }
      }).catch((err: any) => {
        if (err.status === 500) {
          appEvents.emit(AppEvents.alertError, [err.statusText]);
        }
      });
      console.log(this.siteInfo);
      this.getDataList();
    }
    // left tree data
    backendSrv.get('/thingspin/tagdefine').then((res: any) => {
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
      beforeDrop: (event: any) => {
        console.log(event);
        const postData = [];
        if (event.source.cloneModel === undefined) {
          // 우측 트리내에서 이동 할 경우
          console.log("This is right tree - before");
          console.log(event);
          if (event.dest.nodesScope.$nodeScope !== null && event.source.nodeScope !== null) {
            if (event.dest.nodesScope.$nodeScope.$modelValue.tag_id > 0 && event.source.nodeScope.$modelValue.tag_id === 0) {
              // 설비가 태그 밑으로 이동할 경우 예외처리
              console.log("against rules!");
              appEvents.emit(AppEvents.alertError, ["태그는 설비를 포함할 수 없습니다."]);
              return false;
            }
          } else if (event.dest.nodesScope.$nodeScope === null) {
            if (event.source.nodeScope.$modelValue.tag_id > 0) {
              // 태그가 lv1로 이동할 경우
              console.log("against rules!");
              appEvents.emit(AppEvents.alertError, ["태그는 설비에 포함되어야 합니다."]);
              return false;
            }
          }

          if (event.dest.nodesScope.$nodeScope === null) {
            // 설비가 Lv1 로 이동하는 경우
            if (event.source.nodesScope.$nodeScope !== null) {
              console.log("From >= lv2, to == Lv1 ");
              // Src 순서 변경
              for (let _i = event.source.index + 1, _j = event.source.index; _i < event.source.nodesScope.$modelValue.length; _i++ , _j++) {
                event.source.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.source.nodesScope.$modelValue[_i]);
              }
              // Dst 내용 변경
              event.source.nodesScope.$modelValue[event.source.index].value = "0";
              event.source.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

              postData.push(event.source.nodesScope.$modelValue[event.source.index]);
              // Dst 순서 변경
              for (let _i = event.dest.index, _j = event.dest.index + 1; _i < event.dest.nodesScope.$modelValue.length; _i++ , _j++) {
                event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.dest.nodesScope.$modelValue[_i]);
              }
            } else {
              // Lv1 설비 사이의 이동
              if (event.source.index < event.dest.index) {
                console.log("From Lv1 up -> to Lv1 down");
                // 위에서 아래로 이동할 때
                event.dest.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

                postData.push(event.dest.nodesScope.$modelValue[event.source.index]);
                // 이동 후 순서 변경
                for (let _j = event.source.index, _i = _j + 1; _i <= event.dest.index; _i++ , _j++) {
                  event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                  postData.push(event.dest.nodesScope.$modelValue[_i]);
                }
              } else {
                console.log("From Lv1 down -> to Lv1 up");
                event.dest.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

                postData.push(event.dest.nodesScope.$modelValue[event.source.index]);
                for (let _j = event.dest.index + 1, _i = event.dest.index; _i < event.source.index; _i++ , _j++) {
                  event.dest.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                  postData.push(event.dest.nodesScope.$modelValue[_i]);
                }
              }
            }
          } else if (event.source.nodesScope.$nodeScope === null) {
            // 설비1 에서 다른 레벨로 가는 경우
            console.log("From lv1, to >= lv2");
            // Src 순서 변경
            for (let _i = event.source.index + 1, _j = event.source.index; _i < event.source.nodesScope.$modelValue.length; _i++ , _j++) {
              event.source.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

              postData.push(event.source.nodesScope.$modelValue[_i]);
            }
            // 부모정보 변경
            const toNode = event.dest.nodesScope.$nodeScope;
            const toNodeParent = toNode.$modelValue;
            const to = event.dest;
            event.source.nodesScope.$modelValue[event.source.index].value = toNodeParent.facility_id.toString();
            event.source.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

            postData.push(event.source.nodesScope.$modelValue[event.source.index]);
            // Dst 순서 변경
            for (let _i = to.index, _j = to.index + 1; _i < toNodeParent.children.length; _i++ , _j++) {
              toNodeParent.children[_i].facility_tree_order = _j + 1;

              postData.push(toNodeParent.children[_i]);
            }
          } else {
            console.log("From >= lv2 , to >= lv2 : normal case");
            // src Parent
            const from = event.source;
            const to = event.dest;
            //const fromNode = event.source.nodeScope.$modelValue;
            const fromNodeParent = event.source.nodeScope.$parentNodeScope.$modelValue;
            // dst Parent
            const toNode = event.dest.nodesScope.$nodeScope;
            const toNodeParent = toNode.$modelValue;
            //const idx = event.dest.index;
            if (fromNodeParent.facility_id === toNodeParent.facility_id) {
              if (from.index < to.index) {
                console.log("Same Level : Up -> down");
                if (toNodeParent.children.length > 0) {
                  toNodeParent.children[from.index].facility_tree_order = to.index + 1;

                  postData.push(toNodeParent.children[from.index]);
                  // 이동후 순서 변경
                  for (let _j = from.index, _i = _j + 1; _i <= to.index; _i++ , _j++) {
                    toNodeParent.children[_i].facility_tree_order = _j + 1;

                    postData.push(toNodeParent.children[_i]);
                  }
                }
              } else {
                console.log("Same Level : Down -> up");
                if (toNodeParent.children.length > 0) {
                  toNodeParent.children[from.index].facility_tree_order = to.index + 1;

                  postData.push(toNodeParent.children[from.index]);
                  // 이동후 순서 변경
                  for (let _j = to.index + 1, _i = to.index; _i < from.index; _i++ , _j++) {
                    toNodeParent.children[_i].facility_tree_order = _j + 1;

                    postData.push(toNodeParent.children[_i]);
                  }
                }
              }
            } else {
              // 다른 레벨
              console.log("diff level");
              // Src 순서 변경
              for (let _i = event.source.index + 1, _j = event.source.index; _i < event.source.nodesScope.$modelValue.length; _i++ , _j++) {
                event.source.nodesScope.$modelValue[_i].facility_tree_order = _j + 1;

                postData.push(event.source.nodesScope.$modelValue[_i]);
              }
              // 부모정보 변경
              event.source.nodesScope.$modelValue[event.source.index].value = toNodeParent.facility_id.toString();
              event.source.nodesScope.$modelValue[event.source.index].facility_tree_order = event.dest.index + 1;

              postData.push(event.source.nodesScope.$modelValue[event.source.index]);
              // Dst 순서 변경
              for (let _i = to.index, _j = to.index + 1; _i < toNodeParent.children.length; _i++ , _j++) {
                toNodeParent.children[_i].facility_tree_order = _j + 1;

                postData.push(toNodeParent.children[_i]);
              }
            }
          }
          // Update ! 이동은 정보 업데이트할 필요없으므로 response : true or false
          const test = {
            "Result": postData,
          };
          let result = true;
          console.log("Post before");
          console.log(postData);
          $.ajax({
            type: 'PUT',
            url: `/thingspin/sites/` + this.data + `/facilities/tree`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(test),
            async: false,
            success: (data) => {
              console.log("Post result");
              console.log(data);
              appEvents.emit(AppEvents.alertSuccess, ['이동되었습니다.']);
            },
            error: (request, status, error) => {
              console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
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
          if ((fromNode.facility_id === 0 && toNode === null) || toNode.$modelValue.facility_id === 0) {
            console.log("against rules!");
            appEvents.emit(AppEvents.alertError, ["태그는 설비에 포함되어야 합니다."]);
            return false;
          } else if (fromNode.facility_id === 0 && toNode.$modelValue.tag_id > 0) {
            console.log("against rules!");
            appEvents.emit(AppEvents.alertError, ["태그는 설비에 포함되어야 합니다."]);
            return false;
          }
          const postdata = [];
          let curIdx = idx + 1;
          // source node
          fromNode.facility_tree_order = curIdx;
          fromNode.facility_id = toNode.node.facility_id;
          fromNode.facility_tree_path = toNode.node.facility_tree_path;
          fromNode.site_id = this.data;
          postdata.push(fromNode);
          // target node's child
          for (let i = idx; i < toNode.node.children.length; i++) {
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
            "Result": postdata,
          };
          let exitFlag = true;
          $.ajax({
            type: 'POST',
            url: `/thingspin/sites/` + this.data + `/facilities/tree`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(test),
            async: false,
            success: (data) => {
              console.log("Post result");
              console.log(data);
              this.result = data;
              this.resultIdx = idx;
              appEvents.emit(AppEvents.alertSuccess, ['이동되었습니다.']);
            },
            error: (request, status, error) => {
              exitFlag = false;
              this.resultIdx = -1;
              console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            },
          });
          console.log("Drag check!");
          console.log(exitFlag);
          return exitFlag;
        }
      },
      dropped: (event: any) => {
        const fromNode = event.source.cloneModel;
        if (fromNode === undefined) {
          console.log("This is right tree - after");
        } else {
          console.log("This is left tree - after");
          setTimeout(() => {
            console.log("After dropped!");
            if (this.resultIdx !== -1) {
              event.dest.nodesScope.$nodeScope.node.children[this.resultIdx] = this.result[0];
              event.dest.nodesScope.$nodeScope.$digest();
              console.log(event.dest.nodesScope.$nodeScope);
              console.log(event.dest.nodesScope.$nodeScope.node.children[this.resultIdx]);
            }
          }, 100);
        }
      }
    };
  }
  toggle(scope: any) {
    console.log("toggle!");
    console.log(scope);
    scope.toggle();
  }
  checkEvents(evt: any, node: any) {
    if (evt.keyCode === 27 || evt.type === "blur") {
      if (this.inputForm !== null) {
        this.inputForm.isEditing = false;
      }
      this.inputForm = null;
      if (node.tag_id === 0) {
        node.facility_name = this.editDataBackup;
      } else {
        node.tag_name = this.editDataBackup;
      }
    }
  }

  onKeyPress(evt: any, node: any) {
    console.log(evt);
    if (evt.which === 13) {
      // Enter
      if (node.tag_id === 0) {
        if (this.checkFacilityName(node.facility_name)) {
          this.backendSrv.put(`thingspin/sites/${this.data}/facilities`,
            {
              "Id": node.facility_id,
              "Name": node.facility_name,
              "Desc": node.facility_desc,
              "Lat": parseFloat(node.facility_lat),
              "Lon": parseFloat(node.facility_lon),
              "Imgpath": node.facility_imgpath
            }).then((result: any) => {
              // this.onLoadData(result);
              console.log("Edit the faciltiy");
              console.log(node);
              console.log(result);
              appEvents.emit(AppEvents.alertSuccess, ['이름이 변경되었습니다.']);
              node.isEditing = false;
              this.editDataBackup = "";
              //this.dataList = result;
              this.getDataList();
            }).catch((err: any) => {
              if (err.status === 500) {
                appEvents.emit(AppEvents.alertError, [err.statusText]);
              }
            });
        }
      } else {
        if (this.checkFacilityName(node.facility_name)) {
          this.backendSrv.put(`thingspin/sites/${this.data}/facilities/${node.facility_id}/tag/${node.tag_id}`,
            {
              "Name": node.tag_name,
            }).then((result: any) => {
              // this.onLoadData(result);
              console.log("Edit the tag");
              console.log(node);
              console.log(result);
              appEvents.emit(AppEvents.alertSuccess, ['이름이 변경되었습니다.']);
              node.isEditing = false;
              this.editDataBackup = "";
              //this.dataList = result;
              this.getDataList();
            }).catch((err: any) => {
              if (err.status === 500) {
                appEvents.emit(AppEvents.alertError, [err.statusText]);
              }
            });
        }
      }
    }
  }
  /*
  editElement(scope,node) {
    //const parent = scope.$parent.$parent.$parentNodeScope.node;
    this.facility = {
      name: node.facility_name,
      desc: node.facility_desc,
      lat: node.facility_lat,
      lon: node.lon,
      imgpath: node.facility_path,
      tagName: node.tag_name
    };
    this.onShowFacilityEditView(true);
    // 설비 인지 태그 인지 체크
  }
  */
  removeElement(scope: any, node: any) {
    console.log("================= Remove!");
    console.log(scope);
    const orders = [];
    const deletes = [];
    if (scope.$parent.$parent.$nodeScope === null) {
      // lv1 삭제
      const parent = scope.$parent.$parent.$parent.$modelValue;
      for (let _i = node.facility_tree_order; _i < parent.length; _i++) {
        parent[_i].facility_tree_order = _i;
        orders.push(parent[_i]);
      }
    } else {
      const parent = scope.$parent.$parent.$parentNodeScope.node;
      for (let _i = node.facility_tree_order; _i < parent.children.length; _i++) {
        parent.children[_i].facility_tree_order = _i;
        orders.push(parent.children[_i]);
      }
    }
    deletes.push(node);
    const postData = {
      "Result": orders,
      "Delete": deletes,
    };
    $.ajax({
      type: 'DELETE',
      url: `/thingspin/sites/` + this.data + `/facilities/tree`,
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(postData),
      async: false,
      success: (data) => {
        scope.remove();
        console.log(this.dataList);
        appEvents.emit(AppEvents.alertSuccess, ['삭제되었습니다.']);
      },
      error: (request, status, error) => {
        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
      },
    });
  }


  async asyncDataLoader(id: any): Promise<void> {
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
    // this.isShow = false;
    this.recalculatorSize();
  }

  onShowFacilityEditView(value: any) {
    if (value) {
      this.isEditView = true;
      this.isEditBtn = false;
      this.isEdit = true;
    } else {
      this.isEditView = false;
      this.isEditBtn = true;
      this.isEdit = false;
      this.facility = {
        name: "",
        desc: "",
        lat: "",
        lon: "",
        imgpath: "",
        tagName: "",
      };
    }
  }

  mouseHoverOut(value: any) {
    console.log(value);
    // value.isEditing = false;
    // if (value.tag_id === 0) {
    //   value.facility_name = this.editDataBackup;
    // } else {
    //   value.tag_name = this.editDataBackup;
    // }
  }

  onEditInit(value: any, id: any) {
    this.timeout(() => {
      $('#' + id).focus();
    });
    if (this.inputForm !== null) {
      this.inputForm.isEditing = false;
    }
    this.inputForm = value;
    value.isEditing = true;
    if (value.tag_id === 0) {
      this.editDataBackup = value.facility_name;
    } else {
      this.editDataBackup = value.tag_name;
    }
  }

  onShowEditView(value: any) {
    if (value) {
      this.isEditView = true;
      this.isEditBtn = false;
      if (this.facility.name.length > 0) {
        this.facility.name = "";
        this.facility.desc = "";
        this.facility.lat = "";
        this.facility.lon = "";
        this.facility.imgpath = "";
        this.facility.tagName = "";
      }
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

  recalculatorSize() {
    const total = $('#ts-tag-define-title-left-content').width();
    const calcResult = (total / 2) - 44.719;
    if (calcResult < 248) {
      $('#title-info-right-view').css('display', 'none');
    } else {
      $('#title-info-right-view').css('display', 'inline-flex');
    }
    $('#ts-define-tree-title-left').css('padding-left', (total / 2) - 44.719);
  }

  onFacilityAdd() {
    console.log("===");
    if (this.isEdit) {
      console.log("===================Edit!");
      if (this.checkFacilityName(this.facility.name)) {
        this.onShowFacilityEditView(false);
        this.backendSrv.put(`thingspin/sites/${this.data}/facilities`,
          {
            "SiteId": this.data,
            "Name": this.facility.name,
            "Desc": this.facility.desc,
            "Lat": parseFloat(this.facility.lat),
            "Lon": parseFloat(this.facility.lon),
            "Imgpath": this.facility.imgpath
          }).then((result: any) => {
            // this.onLoadData(result);
            console.log(result);
            appEvents.emit(AppEvents.alertSuccess, ['수정되었습니다.']);
            //this.dataList = result;
          }).catch((err: any) => {
            if (err.status === 500) {
              appEvents.emit(AppEvents.alertError, [err.statusText]);
            }
          });
      }
    } else {
      console.log("===================Add!");
      if (this.checkFacilityName(this.facility.name)) {
        this.onShowEditView(false);
        this.backendSrv.post(`thingspin/sites/${this.data}/facilities`,
          {
            "SiteId": this.data,
            "Name": this.facility.name,
            "Desc": this.facility.desc,
            "Lat": parseFloat(this.facility.lat),
            "Lon": parseFloat(this.facility.lon),
            "Imgpath": this.facility.imgpath
          }).then((result: any) => {
            // this.onLoadData(result);
            console.log(result);
            this.dataList = result;
            appEvents.emit(AppEvents.alertSuccess, ['추가되었습니다.']);
          }).catch((err: any) => {
            if (err.status === 500) {
              appEvents.emit(AppEvents.alertError, [err.statusText]);
            }
          });
      }
    }
  }

  getDataList() {
    this.backendSrv.get(`/thingspin/sites/${this.data}/facilities/tree`, {}).then((result: any) => {
      if (result !== null || result !== undefined) {
        this.dataList = [];
        this.dataList = result;
      } else {
        this.dataList = [];
      }
    }).catch((err: any) => {
      if (err.status === 500) {
        appEvents.emit(AppEvents.alertError, [err.statusText]);
      }
    });
  }

  checkFacilityName(cmpString: string) {
    console.log(this.dataList);
    if (cmpString.toLowerCase() === this.editDataBackup.toLowerCase()) {
      return false;
    }
    for (let count = 0; count < this.dataList.length; count++) {
      console.log("facility_name:" + this.dataList[count].facility_name);
      console.log("label:" + this.dataList[count].label);
      console.log("cmpString:" + cmpString);
      console.log("editDataBackup:" + this.editDataBackup);
      if (this.dataList[count].label.toLowerCase() === cmpString.toLowerCase()) {
        if (this.isEdit) {
          if (this.dataList[count].label.toLowerCase() === this.editDataBackup.toLowerCase()) {
            continue;
            // } else if (this.dataList[count].facility_name.toLowerCase() === cmpString.toLowerCase()) {
            //   return false;
          } else {
            this.timeout(() => {
              $('#facility-name').focus();
            });
            appEvents.emit(AppEvents.alertError, ['같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.']);
            return false;
          }
        } else {
          this.timeout(() => {
            $('#facility-name').focus();
          });
          appEvents.emit(AppEvents.alertError, ['같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.']);
          return false;
        }
      }
    }
    return true;
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
