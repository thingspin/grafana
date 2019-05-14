import angular from 'angular';
import "./index.scss";
import config from 'app/core/config';

export class TsMenuManagementCtrl {
  static template = require("./index.html");
  data: any;
  //dataTmp: any;
  options: any;
  backendSrv: any;
  evt: any;
  url: any;
  dashboardList: any;
  menuInfo: any;
  menuInfoType: any;
  clickedMenu: any;
  /** @ngInject */
  constructor(backendSrv) {
    this.backendSrv = backendSrv;

    this.menuInfo = false;
    this.url = "";
    this.menuInfoType = "";
    this.clickedMenu = {
      id: -100,
      icon: "fa fa-folder-o",
      text: "",
      url: ""
    };
    this.options = {
      beforeDrop: (event) => {
        const fromNode = event.source.nodeScope.node;
        const toNode = event.dest.nodesScope.$nodeScope;
        if ( fromNode.parent_id === -1 && toNode != null ) {
          if ( fromNode.children.length > 0 ) {
            return false;
          }
        }
        return true;
      },
      dropped: (event) => {
        console.log(event);
        this.evt = event;

        setTimeout(() => {
          console.log("timeout");
          const fromNode = this.evt.source.nodeScope.node;
          const fromNodeParent = this.evt.source.nodesScope.node;
          const from = this.evt.source;
          const to = this.evt.dest;
          const toNode = this.evt.dest.nodesScope.$nodeScope;

          const plist = [];
          const clist = [];
          if ( fromNode.parent_id === -1 && toNode == null ) {
            console.log("L1 -> L1");
            // L1 -> L1
            // Change some L1 ordering
            if ( from.index < to.index ) {
              console.log("Up -> down");
              // 위에서 아래로 이동할 때
              // 1-1. 이동 후 현재포함 상위 L1 들의 순서 변경
              for ( let _i = 0; _i <= to.index; _i++) {
                this.data[_i].order = _i;
                plist.push(this.data[_i]);
              }
            } else {
              console.log("Down -> to");
              // 아래서 위로 이동할 때
              // 1-2. 이동 후 현재 포함 하위 L1 들의 순서 변경
              for ( let _i = to.index; _i < this.data.length; _i++) {
                this.data[_i].order = _i;
                plist.push(this.data[_i]);
              }
            }
          } else if ( fromNode.parent_id === -1 && toNode != null ) {
            console.log("L1 -> L2");
            // 1. source idx 부터 하위 L1 들의 순서변경
            // 2-1. dest id로 부모 노드를 찾는다.
            // 2-2. dest 부모 노드의 자식 dst idx 부터 하위 L2 들의 순서변경
            for ( let _i = 0; _i < this.data.length; _i++) {
              if ( toNode.node.id === this.data[_i].id) {
                // 부모 id 변경
                this.data[_i].children[to.index].parent_id = toNode.node.id;
                // L2 순서 조정
                for ( let _j = to.index; _j < toNode.node.children.length; _j++) {
                  this.data[_i].children[_j].order = _j;
                  clist.push(this.data[_i].children[_j]);
                  console.log("Child Update :" +this.data[_i].children[_j].text+" > new order:",_j);
                }
                break;
              }
            }
            for ( let _i = from.index; _i < this.data.length; _i++) {
              this.data[_i].order = _i;
              plist.push(this.data[_i]);
              console.log("Update :" + this.data[_i].text+" > new order:",_i);
            }
          } else if ( fromNode.parent_id !== -1 && toNode == null ) {
            console.log("L2 -> L1");
            // L2 -> L1
            // Change some L1 ordering and the L2 ordering
            // 1. 이동 후 현재포함 하위 L1 들의 순서 변경
            // 2. src id로 부모 노드를 찾고, idx 부터 하위 노드들의 순서 변경
            this.data[to.index].parent_id = -1;
            console.log("Parent Update :" +this.data[to.index].text+" > new order:",-1);
            for ( let _i = to.index; _i < this.data.length; _i++) {
              this.data[_i].order = _i;
              plist.push(this.data[_i]);
              console.log("Update :" + this.data[_i].text+" > new order:",_i);
            }

            for ( let _i = 0; _i < this.data.length; _i++) {
              if ( fromNodeParent.id === this.data[_i].id) {
                console.log("Found parent - ",this.data[_i].text);
                for ( let _j = from.index; _j < this.data[_i].children.length; _j++) {
                  this.data[_i].children[_j].order = _j;
                  clist.push(this.data[_i].children[_j]);
                  console.log("Child Update :" +this.data[_i].children[_j].text+" > new order:",_j);
                }
                break;
              }
            }
          } else if ( fromNode.parent_id !== -1 && toNode != null ) {
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
              for ( let _i = from.index; _i < this.data[fromNodeParent.order].children.length; _i++) {
                console.log("src Child Update :" +this.data[fromNodeParent.order].children[_i].text+" > new order:",_i);
                this.data[fromNodeParent.order].children[_i].order = _i;
                clist.push(this.data[fromNodeParent.order].children[_i]);
              }
              this.data[toNode.node.order].children[to.index].parent_id = toNode.node.id;
              console.log("dst Child Parent Update :" +this.data[toNode.node.order].children[to.index].text+" > new parent:",toNode.node.text);
              for ( let _i = to.index; _i < toNode.node.children.length; _i++) {
                console.log("dst Child Update :" +this.data[toNode.node.order].children[_i].text+" > new order:",_i);
                this.data[toNode.node.order].children[_i].order = _i;
                clist.push(this.data[toNode.node.order].children[_i]);
              }
            }
          } else {
            console.log("else");
            // else
          }

          const newData = {
            "child": clist,
            "parent": plist
          };
          this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
            console.log("After ordering, ok!");
            //this.dataTmp = null;
          }).catch((err: any) => {
            console.log("After ordering, error!");
            console.log(err);
            /*
            this.data = [];
            for ( let _i = 0; _i < this.dataTmp.length; _i++) {
              this.data.push(this.dataTmp[_i]);
            }
            //this.data = this.dataTmp;
            console.log(this.dataTmp);
            this.dataTmp = null;
            */
          });
        },100);
      }
    };
    // load the menu list
    this.backendSrv.get('/thingspin/menu/'+config.bootData.user.orgId).then( data => {
      this.data = data;
      console.log("raw data");
      console.log(this.data);
    });
    // load dashboard list
    this.backendSrv.get('/api/search').then( data => {
      this.dashboardList = data;
      console.log(this.dashboardList);
    });
  }

  cloneMenu(node) {
  }
  menuClicked(node) {
    console.log(node);
    console.log("clicked!");
    this.menuInfo = true;
    //this.url = "";
    this.clickedMenu = node;
  }
  blur(scope,node) {
    console.log("hide!");
    console.log(scope);
    console.log(node);
    node.hideFromMenu = !node.hideFromMenu;
    this.backendSrv.put('/thingspin/menu/hide/'+node.id+'/'+node.hideFromMenu,{}).then((res: any) => {
      console.log("After blurring, success!");
      // id 및 get 했을 때 얻어왔던 값들을 모두 받아와야한다.
    }).catch((err: any) => {
      console.log("After blurring, error!");
      console.log(err);
      node.hideFromMenu = !node.hideFromMenu;
    });
  }

  changeUrl() {
    console.log("change url");
    console.log(this.url);
    if (this.url != null) {
      this.clickedMenu.url = this.url;
    }
    //this.url = "";
  }
  toggle(scope) {
      console.log("toggle!");
      console.log(scope);
      scope.toggle();
  }

  createMenu() {
    console.log("trying to create a menu!");
    //var nodeData = this.tree2[this.tree2.length - 1];
    if (this.clickedMenu.id < 0) {
      console.log("new Menu");
      this.clickedMenu.order = this.data.length;
      this.backendSrv.post('/thingspin/menu/'+config.bootData.user.orgId,this.clickedMenu).then((res: any) => {
        console.log("After creating, success!");
        console.log(res);
        this.data.push(res);
        this.clickedMenu = res;
      }).catch((err: any) => {
        console.log("After creating, error!");
        console.log(err);
      });
    } else {
      console.log("modify Menu");
      console.log(this.clickedMenu);
      const newData = {
        "menu": this.clickedMenu
      };
      this.backendSrv.put('/thingspin/menu/',newData).then((res: any) => {
        console.log("After modifying, success!");
      }).catch((err: any) => {
        console.log("After modifying, error!");
        console.log(err);
      });
    }
    // init
    this.menuInfo = false;
  }

  newMenu() {
      console.log("Create button Clicked!");
      this.menuInfo = true;
      this.url = "";
      this.clickedMenu = {
        parent_id: -1,
        id: -100,
        icon: "fa fa-folder-o",
        text: "",
        url: ""
      };
  }

  remove(scope, node) {
      const nodes = [];
      if (node.parent_id === -1) {
        // L1
        // 삭제후에 L1 순서 재조정
        for ( let _i = node.order; _i < this.data.length; _i++) {
          this.data[_i].order = _i;
          nodes.push(this.data[_i]);
        }
      } else {
        // L2
        // 삭제 후 L2 순서 재조정
        const parent = scope.$parent.$parent.$parentNodeScope.node;
        for ( let _i = 0; _i < this.data.length; _i++) {
          if ( parent.id === this.data[_i].id) {
            console.log("Found parent - ",this.data[_i].text);
            for ( let _j = node.order; _j < this.data[_i].children.length; _j++) {
              this.data[_i].children[_j].order = _j;
              nodes.push(this.data[_i].children[_j]);
            }
            break;
          }
        }
      }
      const newData = {
        "menu": nodes
      };
      this.backendSrv.delete('/thingspin/menu/'+config.bootData.user.orgId+"/"+node.id,newData).then((res: any) => {
        console.log("After deleting, success!");
        scope.remove();
      }).catch((err: any) => {
        console.log("After deleting, error!");
        console.log(err);
      });
  }
  link(scope, elem, attrs, ctrl) {
      //ctrl.scope = scope;
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
