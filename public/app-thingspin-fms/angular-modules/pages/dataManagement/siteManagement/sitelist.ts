import _ from "lodash";
import angular from "angular";
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/core';
import "./sitelist.scss";

interface SiteTableData {
    id: string;
    name: string;
    desc: string;
    lat: string;
    lon: string;
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


export class TsSiteListCtrl implements angular.IController {
    data: any;
    list: SiteTableData[];
    tData: TableModel = {
        rowCount: 10,
        selectOpts: [10, 20, 30],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };
    isEdit: boolean;
    isEditView: boolean;
    isEditBtn: boolean;
    name: string;
    desc: string;
    lat: string;
    lon: string;
    selIdx: any;

    /** @ngInject */
    constructor(
        private $scope: angular.IScope,
        private backendSrv: BackendSrv,
        private $location: angular.ILocationService,
    ) {
        this.isEdit = false;
        this.isEditView = false;
        this.isEditBtn = true;
        this.list = [];
        this.asyncDataLoader();

        this.selIdx = -1;
    }// Dependency Injection

    $onInit(): void {
        console.log("SiteTable : " + this.data);
    }

    $onDestroy(): void {
    }
    editSite(site) {
        this.onShowEditView(true);
        this.isEdit = true;
        this.data = site.id;
        this.name = site.name;
        this.desc = site.desc;
        this.lon = site.lon;
        this.lat = site.lat;
        console.log("==========Edit site");
        console.log(site);
    }
    removeSite(sid) {
        console.log("Remove site");
        console.log(sid);
        this.backendSrv.delete("/thingspin/sites/"+sid).then((result) => {
            console.log("Remove after");
            console.log(result);
            appEvents.emit('alert-success', ['삭제되었습니다.']);
            this.onLoadData(result);
        }).catch(err => {
            if (err.status === 500) {
              appEvents.emit('alert-error', [err.statusText]);
            }
        });
    }
    onShowEditView(value) {
        if (value) {
            this.name = "";
            this.desc = "";
            this.lon = "";
            this.lat = "";
            this.isEdit = false;
            this.isEditView = true;
            this.isEditBtn = false;
        } else {
            this.isEditView = false;
            this.isEditBtn = true;
        }
    }
    onSiteAdd(): void {
        if (this.isEdit) {
            // Edit
            console.log("sid");
            console.log(this.data);
            this.backendSrv.put("/thingspin/sites",
            {
                "Id": this.data,
                "Name": this.name,
                "Desc": this.desc,
                "Lat": parseFloat(this.lat),
                "Lon": parseFloat(this.lon),
            }).then((result) => {
                appEvents.emit('alert-success', ['수정되었습니다.']);
                this.onLoadData(result);
            }).catch(err => {
                if (err.status === 500) {
                  appEvents.emit('alert-error', [err.statusText]);
                }
            });
        } else {
            // Add
            this.backendSrv.post("/thingspin/sites",
            {
                "Name": this.name,
                "Desc": this.desc,
                "Lat": parseFloat(this.lat),
                "Lon": parseFloat(this.lon),
            }).then((result) => {
                appEvents.emit('alert-success', ['추가되었습니다.']);
                this.onLoadData(result);
            }).catch(err => {
                if (err.status === 500) {
                  appEvents.emit('alert-error', [err.statusText]);
                }
            });
        }
    }

    siteAdd(): void {
        console.log("siteAdd click");
        this.data = "Site id test = 1";
    }

    async asyncDataLoader(): Promise<void> {
        console.log("asyncDataLoader");
        try {
            const list = await this.backendSrv.get("/thingspin/sites");
            console.log(list);
            this.onLoadData(list);
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    onLoadData(item) {
        this.list = [];
        console.log(item);
        if (item !== null || item !== undefined) {
            for (let i = 0; i< item.length; i++) {
                const siteItem = {} as SiteTableData;
                siteItem.id = item[i].id;
                siteItem.name = item[i].name;
                siteItem.desc = item[i].desc;
                siteItem.lat = item[i].lat;
                siteItem.lon = item[i].lon;
                this.list.push(siteItem);
            }
            this.initTable();
        }
    }
    // TABLE Method
    tableClick(value, idx) {
        console.log(idx);
        this.data = value;
        this.selIdx = idx;
        this.tableSelect(idx);
        this.$location.path(`/thingspin/manage/data/site/${value}`);
    }

    tableSelect(idx) {
        //maxPageLen
        for (let i = 0; i< this.tData.maxPageLen; i++) {
            if (i === idx) {
                $('#table-tr-' + i).removeClass('ts-table-row');
                $('#table-tr-' + i).addClass('selected');
            } else {
                $('#table-tr-' + i).removeClass('selected');
                $('#table-tr-' + i).addClass('ts-table-row');
            }
        }
    }

    initTable(): void {
        this.$scope.$watch("list", () => {
            this.tCalcPaging();
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
        console.log("click");
        this.tCalcPaging();
        this.setPageNodes();
    }
}

export class TsSiteListDirective implements angular.IDirective {
    templateUrl = require('./sitelist.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'ctrl';
    controller = TsSiteListCtrl;
    scope = {};
    /** @ngInject */
    constructor() {
    }
}

coreModule.directive('tsSiteList', [() => new TsSiteListDirective()]);
