import angular from 'angular';
import "./index.scss";
import config from 'app/core/config';

export class TsMenuManagementCtrl {
  static template = require("./index.html");
  tree1: any;
  tree2: any;
  data: any;
  clickedData: any;
  scope: any;
  options: any;
  /** @ngInject */
  constructor(backendSrv) {
    this.options = {
      dropped: (event) => {
        console.log("dropped");
        console.log(event);
        /*
        let cnt = 0;
        let cnt2 = 0;
        for (const _i in this.data) {
          this.data[_i]["idx"] = cnt;
          cnt = cnt + 1;
          cnt2 = 0;
          for (const _j in this.data[_i].children) {
            this.data[_i].children[_j]["idx"] = cnt2;
            cnt2 = cnt2 + 1;
          }
        }
        */
      }
    };
    console.log(backendSrv);
    backendSrv.get('/thingspin/menu/'+config.bootData.user.orgId).then( data => {
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

    //console.log(config.bootData.user.orgId);
    /*
    this.data = [{
      'id': 1,
      'title': 'tree1 - item1',
      'hide': false,
      'nodes': [
          {
              "id": 10,
              "title": "tree1 - item1.1",
              "nodes": []
          }
      ]
      }, {
      'id': 2,
      'title': 'tree1 - item2',
      'hide': false,
      'nodes': []
      }, {
      'id': 3,
      'title': 'tree1 - item3',
      'hide': false,
      'nodes': []
      }, {
      'id': 4,
      'title': 'tree1 - item4',
      'hide': false,
      'nodes': []
      }];
      */
  }

  hide(scope,node) {
    console.log("hide!");
    console.log(scope);
    console.log(node);
  }

  toggle(scope) {
      console.log("toggle!");
      console.log(scope);
      scope.toggle();
      //scope.toggle();
  }

  newItem() {
      //var nodeData = this.tree2[this.tree2.length - 1];
      this.data.push({
        id: this.data.length + 1,
        title: 'node ' + (this.data.length + 1),
        hide: false
      });
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
  remove(scope) {
      console.log(scope);
      console.log("remove");
      scope.remove();
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
