import angular from 'angular';

export class TsMenuManagementCtrl {
  static template = require("./index.html");
  tree1: any;
  tree2: any;
  data: any;
  scope: any;
  /** @ngInject */
  constructor() {
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
      ctrl.scope = scope;
  }
}
export function tsMenuManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/systemManagement/menuManagement/index.html',
    controller: TsMenuManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsMenuManagement', tsMenuManagementDirective);
