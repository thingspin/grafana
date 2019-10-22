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

export interface ClickedMenu {
  id: number;
  parent_id: number;
  icon: string;
  text: string;
  url: string;

  order?: number;
}

function changeOrder(target: any[], start: number, end: number = target.length) {
  const list = [];
  for (let i = start; i < end; i += 1) {
    // use call-by-reference
    target[i].order = i;
    list.push(target[i]);
  }
  return list;
}

export class TsMenuManagementCtrl {
  data: any[] = [];
  evt: any;
  url = '';
  menuInfo = false;
  clickedMenu: ClickedMenu = {
    parent_id: -1,
    id: -100,
    icon: 'fa fa-folder-o',
    text: '',
    url: ''
  };
  dashboardList: any[] = [];

  options = {
    beforeDrop: ({ source, dest }: any) => {
      const { parent_id, children } = source.nodeScope.node;
      const toNode = dest.nodesScope.$nodeScope;

      return !(parent_id === -1 && toNode != null && children.length);
    },
    dropped: (event: any) => {
      this.evt = event;
      setTimeout(() => {
        const from = this.evt.source;
        const to = this.evt.dest;
        const fromNode = from.nodeScope.node;
        const toNode = to.nodesScope.$nodeScope;

        let plist = [];
        let clist = [];
        if (fromNode.parent_id === -1 && toNode == null) {
          console.log("L1 -> L1");
          if (from.index < to.index) {
            console.log("Up -> down");
          } else {
            console.log("Down -> to");
          }

          // L1 -> L1
          // Change some L1 ordering
          plist = (from.index < to.index)
            // 위에서 아래로 이동할 때
            // 1-1. 이동 후 현재포함 상위 L1 들의 순서 변경
            ? changeOrder(this.data, 0, to.index)
            // 아래서 위로 이동할 때
            // 1-2. 이동 후 현재 포함 하위 L1 들의 순서 변경
            : changeOrder(this.data, to.index);
        } else if (fromNode.parent_id === -1 && toNode != null) {
          console.log("L1 -> L2");
          // 1. source idx 부터 하위 L1 들의 순서변경
          // 2-1. dest id로 부모 노드를 찾는다.
          // 2-2. dest 부모 노드의 자식 dst idx 부터 하위 L2 들의 순서변경
          const { node } = toNode;
          for (const { children, id } of this.data) {
            if (node.id === id) {
              // 부모 id 변경
              children[to.index].parent_id = node.id;
              // L2 순서 조정
              clist = changeOrder(children, to.index, node.children.length);
              break;
            }
          }

          plist = changeOrder(this.data, from.index);
        } else if (fromNode.parent_id !== -1 && toNode == null) {
          console.log("L2 -> L1");
          // L2 -> L1
          // Change some L1 ordering and the L2 ordering
          // 1. 이동 후 현재포함 하위 L1 들의 순서 변경
          // 2. src id로 부모 노드를 찾고, idx 부터 하위 노드들의 순서 변경
          this.data[to.index].parent_id = -1;
          console.log("Parent Update :" + this.data[to.index].text + " > new order:", -1);
          plist = changeOrder(this.data, to.index);

          const fromNodeParent = this.evt.source.nodesScope.node;
          for (const item of this.data) {
            if (fromNodeParent.id === item.id) {
              console.log("Found parent - ", item.text);
              clist = changeOrder(item.children, from.index);
              break;
            }
          }
        } else if (fromNode.parent_id !== -1 && toNode != null) {
          console.log("L2 -> L2");
          // L2 -> L2
          // Change the src L2 ordering and the dst L2 ordering
          // src id로 부모노드를 찾고, idx 부터 하위 노드들의 순서를 변경
          // dst $noescope의 node의 children의 dst idx부터 하위 노드들의 순서변경
          const { order, id } = this.evt.source.nodesScope.node;
          if (toNode.node.id === id) {
            const { children } = this.data[order];
            const fromChild = children[from.index];
            const toChild = children[to.index];

            console.log("Same Parent");
            console.log("Change " + fromChild.text + " <-> " + toChild.text);

            // Swap(use call-by-rederence)
            const tmp = fromChild.order;
            fromChild.order = toChild.order;
            toChild.order = tmp;

            clist = [ fromChild, toChild, ];
          } else {
            console.log("Diff Parent");
            const a = changeOrder(this.data[order].children, from.index);

            const toChildren = this.data[toNode.node.order].children;
            const toChild = toChildren[to.index];
            toChild.parent_id = toNode.node.id;
            console.log("dst Child Parent Update :" + toChild.text + " > new parent:", toNode.node.text);
            const b = changeOrder(toChildren, to.index, toNode.node.children.length);

            clist.push(...a, ...b);
          }
        }

        const newData = {
          child: clist,
          parent: plist
        };
        this.backendSrv.put('/thingspin/menu/' + orgId, newData).then((res: any) => {
          store.dispatch(updateTsMenu(orgId));
        }).catch((err: any) => {
          console.log("After ordering, error!");
          console.log(err);
        });
      }, 100);
    }
  };

  /** @ngInject */
  constructor(private $scope: angular.IScope, private backendSrv: BackendSrv) {
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
      await this.backendSrv.put(`/thingspin/menu/hide/${node.id}/${node.hideFromMenu}`, {});
      // id 및 get 했을 때 얻어왔던 값들을 모두 받아와야한다.
      store.dispatch(updateTsMenu(orgId));
    } catch (err) {
      node.hideFromMenu = !node.hideFromMenu;
    }
  }

  changeUrl() {
    if (this.url) {
      this.clickedMenu.url = this.url;
    }
  }

  toggle(scope: any) {
    scope.toggle();
  }

  async createMenu() {
    try {
      if (this.clickedMenu.id < 0) {
        this.clickedMenu.order = this.data.length;
        const res = await this.backendSrv.post(`/thingspin/menu/${orgId}`, this.clickedMenu);
        this.data.push(res);
        this.clickedMenu = res;
      } else {
        await this.backendSrv.put('/thingspin/menu/', { menu: this.clickedMenu });
      }
      // init
      this.menuInfo = false;
      this.$scope.$applyAsync();
      store.dispatch(updateTsMenu(orgId));
    } catch (e) {
      console.error(e);
    }
  }

  newMenu() {
    this.menuInfo = true;
    this.url = '';
    this.clickedMenu = {
      parent_id: -1,
      id: -100,
      icon: 'fa fa-folder-o',
      text: '',
      url: ''
    };
  }

  async remove(scope: any, { parent_id, order, id }: any) {
    if (parent_id === -1) {
      // L1
      // 삭제후에 L1 순서 재조정
      changeOrder(this.data, order);
    } else {
      // L2
      // 삭제 후 L2 순서 재조정
      const parent = scope.$parent.$parent.$parentNodeScope.node;

      const idx = this.data.findIndex((item) => parent.id === item.id);
      if (idx !== -1) {
        const { children } = this.data[idx];
        changeOrder(children, order);
      }
    }

    try {
      await this.backendSrv.delete(`/thingspin/menu/${orgId}/${id}`);
      store.dispatch(updateTsMenu(orgId));
      scope.remove();
    } catch (err) {
      console.error(err);
    }
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
