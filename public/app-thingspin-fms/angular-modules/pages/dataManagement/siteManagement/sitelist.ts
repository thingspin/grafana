// js 3rd party libs
import _ from "lodash";
import $ from 'jquery';
import angular, { ITimeoutService } from "angular";

// Grafana libs
import { AppEvents } from '@grafana/data';
import { appEvents } from 'app/core/core';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

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
    id: any;
    list: SiteTableData[] = [];
    tData: TableModel = {
        rowCount: 10,
        selectOpts: [10, 20, 30],
        currPage: 0,
        maxPage: 0,
        maxPageLen: 10,
        pageNode: [],
    };
    isEdit = false;
    isEditView = false;
    isListView = true;
    isAddSiteBtn = true;

    editName: string;
    name: string;
    desc: string;
    lat: string;
    lon: string;

    /** @ngInject */
    constructor( // Dependency Injection
        private $scope: angular.IScope,
        private backendSrv: BackendSrv,
        private $location: angular.ILocationService,
        $timeout: ITimeoutService,
    ) {
        this.asyncDataLoader();

        $scope.$watch('ctrl.isEditView', (value) => (value && $timeout(() => {
            $('#site-name').focus();
        })));
    }

    $onInit(): void { }

    $onDestroy(): void { }

    editSite({ name, id, desc, lon, lat }: SiteTableData) {
        this.onShowEditView(true);
        this.isEdit = true;
        this.editName = this.name = name;
        this.id = id;
        this.desc = desc;
        this.lon = lon;
        this.lat = lat;
    }

    removeSite(sid: any) {
        $.ajax({
            type: 'DELETE',
            url: `/thingspin/sites/${sid}`,
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            async: false,
            success: (result) => {
                appEvents.emit(AppEvents.alertSuccess, ['삭제되었습니다.']);
                this.onLoadData(result);
            },
            error: (request, status, err) => {
                appEvents.emit(AppEvents.alertError, [err]);
            },
        });
    }

    onShowEditView(value: any) {
        this.isEditView = !!value;
        this.isListView = !value;
        this.isAddSiteBtn = !value;

        if (value) {
            this.name = '';
            this.desc = '';
            this.lon = '';
            this.lat = '';
            this.isEdit = false;
            $('#site-name').focus();
        }
    }

    async onSiteAdd() {
        try {
            if (!this.name) {
                this.openAlartNotification("사이트에 이름을 입력해주세요.");
            } else if (this.checkCmpSiteName()) {
                const payload: any = {
                    Name: this.name,
                    Desc: this.desc,
                    Lat: parseFloat(this.lat),
                    Lon: parseFloat(this.lon),
                };

                let msg;
                if (this.isEdit) { // Edit
                    payload.Id = this.id;
                    msg = '수정되었습니다.';
                } else { // Add
                    msg = '추가되었습니다.';
                }

                const result = await this.backendSrv[this.isEdit ? 'put' : 'post']("/thingspin/sites", payload);
                appEvents.emit(AppEvents.alertSuccess, [msg]);
                this.onLoadData(result);
                this.onShowEditView(false);
                this.$scope.$applyAsync();
            }
        } catch ({ status, statusText }) {
            if (status === 500) {
                appEvents.emit(AppEvents.alertError, [statusText]);
            }
        }
    }

    checkCmpSiteName() {
        for (const { name } of this.list) {
            const convName = name.toLowerCase();

            if (convName === this.name.toLowerCase()) {

                if (this.isEdit && convName === this.editName.toLowerCase()) {
                    continue;
                }

                this.openAlartNotification("같은 이름에 사이트가 있습니다. 다름 이름을 입력해주세요.");
                return false;
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

    onLoadData(items: SiteTableData[]) {
        this.list = [];

        if (Array.isArray(items)) {
            for (const { id, name, desc, lat, lon } of items) {
                const strID = id.toString();
                this.list.push({
                    id,
                    titleid: `SITE_${strID.padStart(5, '0')}`,
                    name,
                    desc,
                    lat,
                    lon,
                });
            }
        }
        this.initTable();
    }

    // TABLE Method
    tableClick(id: any, idx: number) {
        this.id = id;

        for (let i = 0; i < this.tData.maxPageLen; i += 1) {
            const $tr = $('#table-tr-' + i);

            let rmCls, addCls;
            if (i === idx) {
                rmCls = 'ts-table-row';
                addCls = 'selected';
            } else {
                rmCls = 'selected';
                addCls = 'ts-table-row';
            }

            $tr.removeClass(rmCls);
            $tr.addClass(addCls);
        }
        this.$location.path(`/thingspin/manage/data/site/${id}`);
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
