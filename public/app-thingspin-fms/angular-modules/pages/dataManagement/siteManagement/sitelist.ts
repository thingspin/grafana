// js 3rd party libs
import _ from "lodash";
import $ from 'jquery';
import angular, { ITimeoutService } from "angular";

// Grafana libs
import { AppEvents } from '@grafana/data';
import { appEvents } from 'app/core/core';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import "./sitelist.scss";

interface SiteTableData {
    id: string;
    titleid: string;
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
    isListView: boolean;
    isAddSiteBtn: boolean;
    editName: string;
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
        $timeout: ITimeoutService,
    ) {
        this.isEdit = false;
        this.isEditView = false;
        this.isListView = true;
        this.isAddSiteBtn = true;
        this.list = [];
        this.asyncDataLoader();

        this.selIdx = -1;

        $scope.$watch('ctrl.isEditView', (value) => {
            if (value) {
                $timeout(() => {
                    $('#site-name').focus();
                });
            }
        });
    }// Dependency Injection

    $onInit(): void {
    }

    $onDestroy(): void {
    }


    editSite(site: any) {
        this.onShowEditView(true);
        this.isEdit = true;
        this.editName = site.name;
        this.data = site.id;
        this.name = site.name;
        this.desc = site.desc;
        this.lon = site.lon;
        this.lat = site.lat;
        console.log("==========Edit site");
        console.log(site);
    }
    removeSite(sid: any) {
        $.ajax({
            type: 'DELETE',
            url: `/thingspin/sites/${sid}`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            async: false,
            success: (result) => {
                console.log("Remove after");
                console.log(result);
                appEvents.emit(AppEvents.alertSuccess, ['삭제되었습니다.']);
                this.onLoadData(result);
            },
            error: (request, status, err) => {
                appEvents.emit(AppEvents.alertError, [err]);
            },
        });
    }
    onShowEditView(value: any) {
        if (value) {
            this.name = "";
            this.desc = "";
            this.lon = "";
            this.lat = "";
            this.isEdit = false;
            this.isEditView = true;
            this.isListView = false;
            this.isAddSiteBtn = false;
            $('#site-name').focus();
        } else {
            this.isEditView = false;
            this.isListView = true;
            this.isAddSiteBtn = true;
        }
    }
    onSiteAdd(): void {
        if (this.isEdit) {
            // Edit
            if (this.checkCmpSiteName()) {
                this.backendSrv.put("/thingspin/sites", {
                    Id: this.data,
                    Name: this.name,
                    Desc: this.desc,
                    Lat: parseFloat(this.lat),
                    Lon: parseFloat(this.lon),
                }).then((result: any) => {
                    appEvents.emit(AppEvents.alertSuccess, ['수정되었습니다.']);
                    this.onLoadData(result);
                    this.onShowEditView(false);
                }).catch((err: any) => {
                    if (err.status === 500) {
                        appEvents.emit(AppEvents.alertError, [err.statusText]);
                    }
                });

            }
        } else {
            // Add
            if (this.name) {
                if (this.checkCmpSiteName()) {
                    this.backendSrv.post("/thingspin/sites", {
                        Name: this.name,
                        Desc: this.desc,
                        Lat: parseFloat(this.lat),
                        Lon: parseFloat(this.lon),
                    }).then((result: any) => {
                        appEvents.emit(AppEvents.alertSuccess, ['추가되었습니다.']);
                        this.onLoadData(result);
                        this.onShowEditView(false);
                    }).catch((err: any) => {
                        if (err.status === 500) {
                            appEvents.emit(AppEvents.alertError, [err.statusText]);
                        }
                    });
                }
            } else {
                if (!this.name) {
                    this.openAlartNotification("사이트에 이름을 입력해주세요.");
                }
            }
        }
    }

    checkCmpSiteName() {
        for (let count = 0; count < this.list.length; count++) {
            if (this.list[count].name.toLowerCase() === this.name.toLowerCase()) {
                if (this.isEdit) {
                    if (this.list[count].name.toLowerCase() === this.editName.toLowerCase()) {
                        continue;
                    } else {
                        this.openAlartNotification("같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.");
                        return false;
                    }
                } else {
                    this.openAlartNotification("같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.");
                    return false;
                }
            }
        }
        return true;
    }

    async asyncDataLoader(): Promise<void> {
        try {
            const list = await this.backendSrv.get("/thingspin/sites");
            this.onLoadData(list);
            this.$scope.$applyAsync();
        } catch (e) {
            console.error(e);
        }
    }

    siteNameCreate(value: any) {
        let resultStr = "";
        for (let i = 0; i < 5 - value.length; i++) {
            resultStr += "0";
        }
        return resultStr;
    }

    onLoadData(items: any) {
        this.list = [];

        if (Array.isArray(items)) {
            for (const item of items) {
                const { id, name, desc, lat, lon } = item;
                const strID = (id).toString();
                const siteItem: SiteTableData = {
                    id,
                    titleid: "SITE_" + this.siteNameCreate(strID) + id,
                    name,
                    desc,
                    lat,
                    lon,
                };
                this.list.push(siteItem);
            }
        }
        this.initTable();
    }
    // TABLE Method
    tableClick(value: any, idx: any) {
        this.data = value;
        this.selIdx = idx;
        this.tableSelect(idx);
        this.$location.path(`/thingspin/manage/data/site/${value}`);
    }

    tableSelect(idx: any) {
        //maxPageLen
        for (let i = 0; i < this.tData.maxPageLen; i++) {
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
        this.tCalcPaging();
        this.setPageNodes();
    }

    openAlartNotification(value: any) {
        appEvents.emit(AppEvents.alertError, [value]);
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