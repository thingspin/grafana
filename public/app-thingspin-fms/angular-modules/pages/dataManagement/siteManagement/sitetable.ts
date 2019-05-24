import _ from "lodash";
import angular from "angular";

interface MqttTableData {
    name: string;
    topic: string;
    value: string;
}

export interface TableModel {
    // table header data
    rowCount: number; // 페이지당 표시할 행(row) 개수
    selectOpts: number[];
    // table body data
    pageNode: any[];
    // table footer data
    currPage: number;
    maxPage: number;
    maxPageLen: number; // paging 최대 표시 개수
}


export class TsSiteTableCtrl implements angular.IController {
    list: MqttTableData[];
    tData: TableModel = {
        rowCount: 10,
        selectOpts: [10, 20, 30],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };

    constructor(
        private $scope: angular.IScope,
    ) {}// Dependency Injection

    $onInit(): void {
    }

    $onDestroy(): void {
    }


    // TABLE Method
    initTable(): void {
        this.$scope.$watch("list", () => {
            this.setPageNodes();
        });
    }
    setPageNodes() {
        const { currPage, rowCount, } = this.tData;
        if (this.list) {
        this.tData.pageNode = this.list.slice(
            currPage * rowCount,
            (currPage * rowCount) + rowCount
        );
        }
    }

    tNextPaging(): void {
        if (this.tData.currPage < this.tData.maxPage) {
            this.tData.currPage += 1;
            this.setPageNodes();
        }
    }

    tPrevPaging(): void {
        if (this.tData.currPage) {
        this.tData.currPage -= 1;
        this.setPageNodes();
        }
    }

    tSetPaging(index: number) {
        this.tData.currPage = index;
        this.tCalcPaging();
        this.setPageNodes();
    }

    tCalcPaging() {
        const { rowCount } = this.tData;
        const temp: number = (this.list.length && (this.list.length % rowCount) === 0) ? 1 : 0;
        this.tData.maxPage = Math.floor(this.list.length / (rowCount)) - temp;
    }

    tGetPagingNumberArray() {
        const { currPage, maxPageLen, maxPage } = this.tData;
        const index = Math.floor(currPage / maxPageLen);

        const from = index * maxPageLen;
        let to = index * maxPageLen + maxPageLen;
        if (to > maxPage) {
            to = maxPage + 1;
        }

        return _.range(from, to);
    }
        // table event methods
    tOnSelectChange() {
        this.tCalcPaging();
        this.setPageNodes();
    }
}

export class TsSiteTableDirective implements angular.IDirective {
    templateUrl = require('./sitetable.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'tag';
    controller = TsSiteTableCtrl;
    replace = true;

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsSiteTable', [() => new TsSiteTableDirective()]);
