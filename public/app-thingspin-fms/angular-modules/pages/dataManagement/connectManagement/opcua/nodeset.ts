import _ from "lodash";
import angular from 'angular';
import { OpcNodeItem } from 'app-thingspin-fms/react/components/OpcNodeTree/walk';

export class TsOpcUaNodeSetCtrl implements angular.IController {
    // Inheritance scope data
    flowId: string;
    nodes: any[];
    close: boolean;

    // UI setting data //
    // table header data
    pagingNumber: number = 5 as number; // 페이지당 표시할 행(row) 개수
    selectOpts: number[] = [5, 10, 20, 100];
    // table body data
    pageNode: any[];
    // table footer data
    currPage: number = 0 as number;
    maxPage: number = 0 as number;
    maxPageLen: number = 10 as number; // paging 최대 표시 개수

   /** @ngInject */
   constructor($scope: angular.IScope) {
        $scope.$watch("nodes", () => {
            this.tCalcPaging();
            this.setPageNodes();
        });
    }

    removeNode(index: number): void {
        this.nodes.splice(index, 1);
        this.tCalcPaging();
        this.setPageNodes();
    }

    removeAllNode(): void {
        this.nodes = [];
        this.tCalcPaging();
        this.setPageNodes();
    }

    setPageNodes() {
        this.pageNode = this.nodes.slice(
            this.currPage * this.pagingNumber,
            (this.currPage * this.pagingNumber) + this.pagingNumber
        );
    }

    // event methods
    onClickAddNodeTreeItem(item: OpcNodeItem): void {
        const check = this.nodes.findIndex(({ nodeId }) => (nodeId === item.key));
        if (check >= 0) {
            return;
        }

        this.nodes.push(item.item);
        this.tCalcPaging();
        this.setPageNodes();
    }

    // table methods
    tNextPaging(): void {
        if (this.currPage < this.maxPage) {
            this.currPage += 1;
            this.setPageNodes();
        }
    }

    tPrevPaging(): void {
        if (this.currPage) {
            this.currPage -= 1;
            this.setPageNodes();
        }
    }

    tSetPaging(index: number) {
        this.currPage = index;
        this.tCalcPaging();
        this.setPageNodes();
    }

    tCalcPaging() {
        const temp: number = (this.nodes.length && (this.nodes.length % this.pagingNumber) === 0) ? 1 : 0;
        this.maxPage = Math.floor(this.nodes.length / (this.pagingNumber) ) - temp;
    }

    tGetPagingNumberArray() {
        const index = Math.floor(this.currPage / this.maxPageLen);

        const from = index * this.maxPageLen;
        let to = index * this.maxPageLen + this.maxPageLen;
        if (to > this.maxPage) {
            to = this.maxPage + 1;
        }

        return _.range(from, to);
    }
    // table event methods
    tOnSelectChange() {
        this.tCalcPaging();
        this.setPageNodes();
    }
}

export class TsOpcUaNodeSetDirective implements angular.IDirective {
    templateUrl = require('./nodeset.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'cm';
    controller = TsOpcUaNodeSetCtrl;
    scope = {
        flowId: "=",
        nodes: "=",
        close: "=",
    };

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsOpcNodeSet', [() => new TsOpcUaNodeSetDirective()]);
