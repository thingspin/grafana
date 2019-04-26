import angular from 'angular';
import "./index.scss";
import config from 'app/core/config';

export class TsMenuManagementCtrl {
  static template = require("./index.html");
  data: any;
  options: any;
  backendSrv: any;
  evt: any;
  icon: any;
  text: any;
  url: any;
  param: any;
  dashboardList: any;
  isNew: any;
  isModi: any;
  menuInfoType: any;
  /** @ngInject */
  constructor(backendSrv) {
    this.backendSrv = backendSrv;
    // init for menuInfo
    this.icon = "fa fa-folder-o";
    this.isNew = false;
    this.isModi = false;
    this.text = "";
    this.url = "";
    this.param = "";
    this.menuInfoType = "";

    this.options = {
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
          //const treeScope = event.dest.nodesScope.$treeScope;
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
                const newData = {
                  "menu": this.data[_i]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                  console.log("Update :" + this.data[_i].text+" > new order:",_i);
                  console.log(res);
                });
              }
            } else {
              console.log("Down -> to");
              // 아래서 위로 이동할 때
              // 1-2. 이동 후 현재 포함 하위 L1 들의 순서 변경
              for ( let _i = to.index; _i < this.data.length; _i++) {
                this.data[_i].order = _i;
                const newData = {
                  "menu": this.data[_i]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                  console.log("Update :" + this.data[_i].text+" > new order:",_i);
                });
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
                  const newData = {
                    "menu": this.data[_i].children[_j]
                  };
                  this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                    console.log("Child Update :" +this.data[_i].children[_j].text+" > new order:",_j);
                  });
                }
                break;
              }
            }
            for ( let _i = from.index; _i < this.data.length; _i++) {
              this.data[_i].order = _i;
              const newData = {
                "menu": this.data[_i]
              };
              this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                console.log("Update :" + this.data[_i].text+" > new order:",_i);
              });
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
                const newData = {
                  "menu": this.data[_i]
              };
              this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                console.log("Update :" + this.data[_i].text+" > new order:",_i);
              });
            }

            for ( let _i = 0; _i < this.data.length; _i++) {
              if ( fromNodeParent.id === this.data[_i].id) {
                console.log("Found parent - ",this.data[_i].text);
                for ( let _j = from.index; _j < this.data[_i].children.length; _j++) {
                  this.data[_i].children[_j].order = _j;
                  const newData = {
                    "menu": this.data[_i].children[_j]
                  };
                  this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                    console.log("Child Update :" +this.data[_i].children[_j].text+" > new order:",_j);
                  });
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
              let newData = {
                "menu": this.data[fromNodeParent.order].children[from.index]
              };
              this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                newData = {
                  "menu": this.data[fromNodeParent.order].children[to.index]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                });
              });
            } else {
              console.log("Diff Parent");
              for ( let _i = from.index; _i < this.data[fromNodeParent.order].children.length; _i++) {
                console.log("src Child Update :" +this.data[fromNodeParent.order].children[_i].text+" > new order:",_i);
                this.data[fromNodeParent.order].children[_i].order = _i;
                const newData = {
                  "menu": this.data[fromNodeParent.order].children[_i]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                });
              }
              this.data[toNode.node.order].children[to.index].parent_id = toNode.node.id;
              console.log("dst Child Parent Update :" +this.data[toNode.node.order].children[to.index].text+" > new parent:",toNode.node.text);
              for ( let _i = to.index; _i < toNode.node.children.length; _i++) {
                console.log("dst Child Update :" +this.data[toNode.node.order].children[_i].text+" > new order:",_i);
                this.data[toNode.node.order].children[_i].order = _i;
                const newData = {
                  "menu": this.data[toNode.node.order].children[_i]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                });
              }
            }
          } else {
            console.log("else");
            // else
          }
        },100);
      }
    };
    this.backendSrv.get('/thingspin/menu/'+config.bootData.user.orgId).then( data => {
      this.data = data;
      console.log("raw data");
      console.log(this.data);
      /*
      let cnt = 0;
      let cnt2 = 0;
      for (const _i in this.data) {
        console.log(_i);
        console.log(this.data[_i]);
        this.data[_i]["idx"] = cnt;
        cnt = cnt + 1;
        cnt2 = 0;
        for (const _j in this.data[_i].children) {
          this.data[_i].children[_j]["idx"] = cnt2;
          cnt2 = cnt2 + 1;
        }
      }
        */
      /*
      for (const i, const ele2 in this.data) {
        console.log(ele);
        ele["idx"] = cnt;
        for (let _j = 0; _j < ele["children"].length; _j++) {
          ele["children"][_j]["idx"] = _j;
        }
        cnt = cnt + 1;
      }
      */
    });
    this.backendSrv.get('/api/search').then( data => {
      this.dashboardList = data;
      console.log(this.dashboardList);
    });
  }
  blur(scope,node) {
    console.log("hide!");
    console.log(scope);
    console.log(node);
    node.hideFromMenu = !node.hideFromMenu;
    /*
    this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
      // id 및 get 했을 때 얻어왔던 값들을 모두 받아와야한다.
      console.log(res);
    });
    */
  }

  toggle(scope) {
      console.log("toggle!");
      console.log(scope);
      scope.toggle();
      //scope.toggle();
  }

  createNewMenu() {
    console.log("trying to create a menu!");
    //var nodeData = this.tree2[this.tree2.length - 1];
    let max = 100;
    if (this.data.length > 0) {
      max = this.data[0].id;
      for ( let _i = 1; _i < this.data.length; _i++) {
        if (max < this.data[_i].id) {
          max = this.data[_i].id;
        }
      }
    }
    console.log("new Menu");
    const newData = {
      id: max + 100,
      order: this.data.length,
      icon: this.icon,
      text: this.text,
      url: this.url
    };
    console.log(newData);
    this.data.push(newData);
    this.backendSrv.post('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
      // id 및 get 했을 때 얻어왔던 값들을 모두 받아와야한다.
      console.log(res);
    });
    // init
    this.isNew = false;
    this.isModi = false;
    this.text = "";
    this.url = "";
    this.param = "";
    this.menuInfoType = "";
  }

  newMenu() {
      console.log("Create button Clicked!");
      this.isNew = true;
      this.isModi = false;
      this.text = "";
      this.url = "";
      this.param = "";
      this.menuInfoType = "";
  }
/*
  newSubItem(scope) {
      console.log("new item");
      console.log(scope);
      const nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        hide: false,
        nodes: []
      });
  }
*/
  remove(scope, node) {
      console.log(scope);
      console.log(node);
      console.log("remove");
      console.log("Same Parent");
      scope.remove();
      // 삭제후에 순서 재조정
      if (node.parent_id === -1) {
        // L1
        this.backendSrv.delete('/thingspin/menu/'+node.id).then((res: any) => {
          console.log(res);
          // 삭제 후 L2 순서 재조정
          for ( let _i = node.order; _i < this.data.length; _i++) {
              this.data[_i].order = _i;
              const newData = {
                "menu": this.data[_i]
              };
              this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                console.log("Child Update :" +this.data[_i].text+" > new order:",_i);
              });
          }
        });
      } else {
        // L2
        this.backendSrv.delete('/thingspin/menu/'+node.id).then((res: any) => {
          console.log("res");
          // 삭제 후 L2 순서 재조정
          const parent = scope.$parent.$parent.$parentNodeScope.node;
          for ( let _i = 0; _i < this.data.length; _i++) {
            if ( parent.id === this.data[_i].id) {
              console.log("Found parent - ",this.data[_i].text);
              for ( let _j = node.order; _j < this.data[_i].children.length; _j++) {
                this.data[_i].children[_j].order = _j;
                const newData = {
                  "menu": this.data[_i].children[_j]
                };
                this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
                  console.log("Child Update :" +this.data[_i].children[_j].text+" > new order:",_j);
                });
              }
              break;
            }
          }
        });
      }
      /*
      let newData = {
        "menu": this.data[fromNodeParent.order].children[from.index]
      };
      this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
        newData = {
          "menu": this.data[fromNodeParent.order].children[to.index]
        };
        this.backendSrv.put('/thingspin/menu/'+config.bootData.user.orgId,newData).then((res: any) => {
        });
      });
      */
  }
  /*
  collapseAll() {
      this.scope.$broadcast('angular-ui-tree:collapse-all');
  };

  expandAll() {
      this.scope.$broadcast('angular-ui-tree:expand-all');
  };
  */
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
