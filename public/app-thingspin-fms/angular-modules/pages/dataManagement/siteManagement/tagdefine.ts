// js 3rd party libs
import $ from 'jquery';
import angular, { IWindowService, ITimeoutService } from "angular";

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { BackendSrv } from 'app/core/services/backend_srv';

function changeOrder(target: any[], start: number, end = target.length) {
  const list = [];

  for (let i = start; i < end; i += 1) {
    target[i].facility_tree_order = i;

    list.push(parent[i]);
  }

  return list;
}

export class TsTagDefineCtrl {
  // tree
  source: any;
  dataList: any;
  result: any;
  resultIdx: any;
  // facility
  data: any;
  // isShow: boolean;
  isEditView = false;
  isEditBtn = true;
  isEdit = false;
  isTitleEditView = false;
  isTitleView = true;
  facility = {
    name: "",
    desc: "",
    lat: "",
    lon: "",
    imgpath: "",
    tagName: "",
  };
  editDataBackup = '';
  window = angular.element(this.$window);
  inputForm = null as any;
  siteInfo = {
    name: "",
    desc: ""
  };

  options = {
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
          const fromNodeParent = event.source.nodeScope.$parentNodeScope.$modelValue;
          // dst Parent
          const toNode = event.dest.nodesScope.$nodeScope;
          const toNodeParent = toNode.$modelValue;
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
          Result: postData,
        };
        let result = true;
        console.log("Post before");
        console.log(postData);
        $.ajax({
          type: 'PUT',
          url: `/thingspin/sites/${this.data}/facilities/tree`,
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
          postdata.push(toNode.node.children[i]);
        }
        console.log("Post before");
        console.log(postdata);
        // this must be modified because of timing issue
        const test = {
          Result: postdata,
        };
        let exitFlag = true;
        $.ajax({
          type: 'POST',
          url: `/thingspin/sites/${this.data}/facilities/tree`,
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
    dropped: ({ source, dest }: any) => {
      const fromNode = source.cloneModel;
      if (fromNode) {
        setTimeout(() => {
          if (this.resultIdx !== -1) {
            dest.nodesScope.$nodeScope.node.children[this.resultIdx] = this.result[0];
            dest.nodesScope.$nodeScope.$digest();
          }
        }, 100);
      }
    }
  };

  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private $scope: angular.IScope,
    private $location: angular.ILocationService,
    $routeParams: angular.route.IRouteParamsService,
    private $window: IWindowService,
    private $timeout: ITimeoutService,
  ) {
    $scope.$watch('ctrl.isEditView', (value) => (value && $timeout(() => {
      $('#facility-name').focus();
    })));

    this.window.bind('resize', () => {
      const total = $('#ts-tag-define-title-left-content').width();
      const calcResult = (total / 2) - 44.719;
      $('#title-info-right-view').css('display', (calcResult < 248) ? 'none' : 'inline-flex');
      $('#ts-define-tree-title-left').css('padding-left', (total / 2) - 44.719);
    });

    if ($routeParams.id) {
      this.data = +$routeParams.id;
      backendSrv.get(`/thingspin/sites/${$routeParams.id}`, {}).then((result: any) => {
        console.log(result);
        if (result) {
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
    }).catch((err: any) => {
      console.log("After ordering, error!");
      console.log(err);
    });
  }

  toggle(scope: any) {
    scope.toggle();
  }

  checkEvents(evt: any, node: any) {
    if (evt.keyCode === 27 || evt.type === "blur") {
      if (this.inputForm !== null) {
        this.inputForm.isEditing = false;
      }
      this.inputForm = null;
      node[(node.tag_id === 0) ? 'facility_name' : 'tag_name'] = this.editDataBackup;
    }
  }

  onKeyPress(evt: any, node: any) {
    if (evt.which === 13) {
      // Enter
      let p: Promise<any> = null;
      const { facility_id, facility_name, facility_desc, facility_lat, facility_lon, facility_imgpath, tag_id, tag_name } = node;
      if (node.tag_id === 0) {
        if (this.checkFacilityName(facility_name)) {
          p = this.backendSrv.put(`thingspin/sites/${this.data}/facilities`, {
            Id: facility_id,
            Name: facility_name,
            Desc: facility_desc,
            Lat: parseFloat(facility_lat),
            Lon: parseFloat(facility_lon),
            Imgpath: facility_imgpath
          });
        }
      } else {
        p = this.backendSrv.put(`thingspin/sites/${this.data}/facilities/${facility_id}/tag/${tag_id}`, {
          Name: tag_name,
        });
      }

      if (p) {
        p.then(() => {
          appEvents.emit(AppEvents.alertSuccess, ['이름이 변경되었습니다.']);
          node.isEditing = false;
          this.editDataBackup = "";
          this.getDataList();
        }).catch((err: any) => {
          if (err.status === 500) {
            appEvents.emit(AppEvents.alertError, [err.statusText]);
          }
        });
      }
    }
  }

  removeElement(scope: any, node: any) {
    const { $parent } = scope.$parent;

    const { facility_tree_order } = node;
    const Result = (!$parent.$nodeScope)
      // lv1 삭제
      ? changeOrder($parent.$parent.$modelValue, facility_tree_order)
      : changeOrder($parent.$parentNodeScope.node.children, facility_tree_order);
    const Delete = [node];

    const data = JSON.stringify({ Result, Delete, });

    $.ajax({
      type: 'DELETE',
      url: `/thingspin/sites/${this.data}/facilities/tree`,
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data,
      async: false,
      success: () => {
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
      if (result) {
        this.dataList = result;
      }
      this.$scope.$applyAsync();
    } catch (e) {
      console.error(e);
    }
  }

  $onInit(): void {
    this.recalculatorSize();
  }

  onShowFacilityEditView(value: any) {
    this.isEditView = !!value;
    this.isEditBtn = !value;
    this.isEdit = !!value;

    if (!value) {
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
  }

  onEditInit(value: any, id: any) {
    this.$timeout(() => {
      $('#' + id).focus();
    });

    this.inputForm = value;
    value.isEditing = true;
    this.editDataBackup = (value.tag_id === 0) ? value.facility_name : value.tag_name;
  }

  onShowEditView(value: any) {
    this.isEditView = !!value;
    this.isEditBtn = !value;

    if (value && this.facility.name.length) {
      this.facility.name = "";
      this.facility.desc = "";
      this.facility.lat = "";
      this.facility.lon = "";
      this.facility.imgpath = "";
      this.facility.tagName = "";
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
    $('#title-info-right-view').css('display', (calcResult < 248) ? 'none' : 'inline-flex');
    $('#ts-define-tree-title-left').css('padding-left', (total / 2) - 44.719);
  }

  async onFacilityAdd() {
    console.log("===");
    if (this.checkFacilityName(this.facility.name)) {
      let msg = '';
      const api = `thingspin/sites/${this.data}/facilities`;
      const payload = {
        SiteId: this.data,
        Name: this.facility.name,
        Desc: this.facility.desc,
        Lat: parseFloat(this.facility.lat),
        Lon: parseFloat(this.facility.lon),
        Imgpath: this.facility.imgpath
      };

      try {
        if (this.isEdit) {
          console.log("===================Edit!");
          msg = '수정되었습니다.';
          this.onShowFacilityEditView(false);

          await this.backendSrv.put(api, payload);
        } else {
          console.log("===================Add!");
          msg = '추가되었습니다.';
          this.onShowEditView(false);

          this.dataList = await this.backendSrv.post(api, payload);
          this.$scope.$applyAsync();
        }
        appEvents.emit(AppEvents.alertSuccess, [msg]);
      } catch (err) {
        if (err.status === 500) {
          appEvents.emit(AppEvents.alertError, [err.statusText]);
        }
      }
    }
  }

  async getDataList() {
    try {
      this.dataList = await this.backendSrv.get(`/thingspin/sites/${this.data}/facilities/tree`);
      this.$scope.$applyAsync();
    } catch (err) {
      if (err.status === 500) {
        appEvents.emit(AppEvents.alertError, [err.statusText]);
      }
    }
  }

  checkFacilityName(cmpStr: string) {
    const lowerCmpStr = cmpStr.toLowerCase();
    const lEditDataBackup = this.editDataBackup.toLowerCase();

    if (lowerCmpStr === lEditDataBackup) {
      return false;
    }

    for (const { label } of this.dataList) {
      const lLavel = label.toLowerCase();
      if (lLavel === lowerCmpStr) {

        if (this.isEdit && lLavel === lEditDataBackup) {
          continue;
        }

        this.$timeout(() => {
          $('#facility-name').focus();
        });

        appEvents.emit(AppEvents.alertError, ['같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.']);
        return false;
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
