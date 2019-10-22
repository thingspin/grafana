// Js 3rd party libs
import angular from 'angular';

// Grafana libs
import config from 'app/core/config';
import { BackendSrv } from 'app/core/services/backend_srv';
import { store } from 'app/store/store';

// Thingspin libs
import "./index.scss";
import { updateTsMenu } from 'app-thingspin-fms/react/redux/dispayches/tsMenu';

const { orgId } = config.bootData.user;

export class TsMenuManagementCtrl {
  data: any[];
  url = '';
  dashboardList: any;
  menuInfo = false;
  clickedMenu: any;

  options = {
    beforeDrop: ({ source, dest }: any) => {
      const { parent_id, children } = source.nodeScope.node;
      const toNode = dest.nodesScope.$nodeScope;

      return !(parent_id === -1 && toNode && children);
    },
    dropped: ({source, dest}: any) => {
      setTimeout(() => {
        const fromNode = source.nodeScope.node;
        const fromNodeParent = source.nodesScope.node;
        const from = source;
        const to = dest;
        const toNode = dest.nodesScope.$nodeScope;

        const plist = [];
        const clist = [];
        if (fromNode.parent_id === -1 && toNode == null) {
          console.log("L1 -> L1");
          // L1 -> L1
          // Change some L1 ordering
          if (from.index < to.index) {
            console.log("Up -> down");
            // 위에서 아래로 이동할 때
            // 1-1. 이동 후 현재포함 상위 L1 들의 순서 변경
            for (let _i = 0; _i <= to.index; _i++) {
              this.data[_i].order = _i;
              plist.push(this.data[_i]);
            }
          } else {
            console.log("Down -> to");
            // 아래서 위로 이동할 때
            // 1-2. 이동 후 현재 포함 하위 L1 들의 순서 변경
            for (let _i = to.index; _i < this.data.length; _i++) {
              this.data[_i].order = _i;
              plist.push(this.data[_i]);
            }
          }
        } else if (fromNode.parent_id === -1 && toNode != null) {
          console.log("L1 -> L2");
          // 1. source idx 부터 하위 L1 들의 순서변경
          // 2-1. dest id로 부모 노드를 찾는다.
          // 2-2. dest 부모 노드의 자식 dst idx 부터 하위 L2 들의 순서변경
          for (let _i = 0; _i < this.data.length; _i++) {
            if (toNode.node.id === this.data[_i].id) {
              // 부모 id 변경
              this.data[_i].children[to.index].parent_id = toNode.node.id;
              // L2 순서 조정
              for (let _j = to.index; _j < toNode.node.children.length; _j++) {
                this.data[_i].children[_j].order = _j;
                clist.push(this.data[_i].children[_j]);
                console.log("Child Update :" + this.data[_i].children[_j].text + " > new order:", _j);
              }
              break;
            }
          }
          for (let _i = from.index; _i < this.data.length; _i++) {
            this.data[_i].order = _i;
            plist.push(this.data[_i]);
            console.log("Update :" + this.data[_i].text + " > new order:", _i);
          }
        } else if (fromNode.parent_id !== -1 && toNode == null) {
          console.log("L2 -> L1");
          // L2 -> L1
          // Change some L1 ordering and the L2 ordering
          // 1. 이동 후 현재포함 하위 L1 들의 순서 변경
          // 2. src id로 부모 노드를 찾고, idx 부터 하위 노드들의 순서 변경
          this.data[to.index].parent_id = -1;
          console.log("Parent Update :" + this.data[to.index].text + " > new order:", -1);
          for (let _i = to.index; _i < this.data.length; _i++) {
            this.data[_i].order = _i;
            plist.push(this.data[_i]);
            console.log("Update :" + this.data[_i].text + " > new order:", _i);
          }

          for (let _i = 0; _i < this.data.length; _i++) {
            if (fromNodeParent.id === this.data[_i].id) {
              console.log("Found parent - ", this.data[_i].text);
              for (let _j = from.index; _j < this.data[_i].children.length; _j++) {
                this.data[_i].children[_j].order = _j;
                clist.push(this.data[_i].children[_j]);
                console.log("Child Update :" + this.data[_i].children[_j].text + " > new order:", _j);
              }
              break;
            }
          }
        } else if (fromNode.parent_id !== -1 && toNode != null) {
          console.log("L2 -> L2");
          // L2 -> L2
          // Change the src L2 ordering and the dst L2 ordering
          // src id로 부모노드를 찾고, idx 부터 하위 노드들의 순서를 변경
          // dst $noescope의 node의 children의 dst idx부터 하위 노드들의 순서변경
          if (toNode.node.id === fromNodeParent.id) {
            console.log("Same Parent");
            console.log("Change " + this.data[fromNodeParent.order].children[from.index].text +
              " <-> " + this.data[fromNodeParent.order].children[to.index].text);
            const tmp = this.data[fromNodeParent.order].children[from.index].order;
            this.data[fromNodeParent.order].children[from.index].order = this.data[fromNodeParent.order].children[to.index].order;
            this.data[fromNodeParent.order].children[to.index].order = tmp;
            clist.push(this.data[fromNodeParent.order].children[from.index]);
            clist.push(this.data[fromNodeParent.order].children[to.index]);
          } else {
            console.log("Diff Parent");
            for (let _i = from.index; _i < this.data[fromNodeParent.order].children.length; _i++) {
              console.log("src Child Update :" + this.data[fromNodeParent.order].children[_i].text + " > new order:", _i);
              this.data[fromNodeParent.order].children[_i].order = _i;
              clist.push(this.data[fromNodeParent.order].children[_i]);
            }
            this.data[toNode.node.order].children[to.index].parent_id = toNode.node.id;
            console.log("dst Child Parent Update :" + this.data[toNode.node.order].children[to.index].text + " > new parent:", toNode.node.text);
            for (let _i = to.index; _i < toNode.node.children.length; _i++) {
              console.log("dst Child Update :" + this.data[toNode.node.order].children[_i].text + " > new order:", _i);
              this.data[toNode.node.order].children[_i].order = _i;
              clist.push(this.data[toNode.node.order].children[_i]);
            }
          }
        }

        const newData = {
          child: clist,
          parent: plist
        };
        this.backendSrv.put('/thingspin/menu/' + orgId, newData).then((res: any) => {
          store.dispatch(updateTsMenu(orgId));
        });
      }, 100);
    }
  };

  /** @ngInject */
  constructor(private $scope: angular.IScope, private backendSrv: BackendSrv) {
    this.clickedMenu = {
      id: -100,
      icon: 'fa fa-folder-o',
      text: '',
      url: ''
    };

    this.init();
  }

  async init() {
    // load the menu list
    this.data = await this.backendSrv.get(`/thingspin/menu/${orgId}`);
    // load dashboard list
    this.dashboardList = await this.backendSrv.get('/api/search');

    this.$scope.$applyAsync();
  }

  cloneMenu(node: any) { }

  menuClicked(node: any) {
    this.menuInfo = true;
    this.clickedMenu = node;
  }

  async blur(node: any) {
    try {
      node.hideFromMenu = !node.hideFromMenu;
      // id 및 get 했을 때 얻어왔던 값들을 모두 받아와야한다.
      await this.backendSrv.put(`/thingspin/menu/hide/${node.id}/${node.hideFromMenu}`, {});
      store.dispatch(updateTsMenu(orgId));
    } catch (e) {
      node.hideFromMenu = !node.hideFromMenu;
    }
  }

  changeUrl() {
    if (this.url != null) {
      this.clickedMenu.url = this.url;
    }
  }

  toggle(scope: any) {
    scope.toggle();
  }

  async createMenu() {
    if (this.clickedMenu.id < 0) {
      this.clickedMenu.order = this.data.length;
      const res = await this.backendSrv.post(`/thingspin/menu/${orgId}`, this.clickedMenu);
      this.data.push(res);
      this.clickedMenu = res;
    } else {
      const newData = {
        menu: this.clickedMenu
      };
      await this.backendSrv.put('/thingspin/menu/', newData);
    }
    this.menuInfo = false;
    this.$scope.$applyAsync();
    store.dispatch(updateTsMenu(orgId));
  }

  newMenu() {
    this.menuInfo = true;
    this.url = '';
    this.clickedMenu = {
      parent_id: -1,
      id: -100,
      icon: "fa fa-folder-o",
      text: "",
      url: ""
    };
  }

  async remove(scope: any, { parent_id, order, id }: any) {
    if (parent_id === -1) {
      // L1
      // 삭제후에 L1 순서 재조정
      for (let i = order; i < this.data.length; i += 1) {
        this.data[i].order = i;
      }
    } else {
      // L2
      // 삭제 후 L2 순서 재조정
      const parent = scope.$parent.$parent.$parentNodeScope.node;

      const idx = this.data.findIndex((item) => parent.id === item.id);
      if (idx !== -1) {
        const { children } = this.data[idx];

        for (let i = order; i < children.length; i += 1) {
          children[i].order = i;
        }
      }
    }

    await this.backendSrv.delete(`/thingspin/menu/${orgId}/${id}`);
    store.dispatch(updateTsMenu(orgId));
    scope.remove();
  }
}

/** @ngInject */
export function tsMenuManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsMenuManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsMenuManagement', tsMenuManagementDirective);
