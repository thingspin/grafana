// 3rd party libs
import _ from "lodash";

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import './notificationsEditCtrl';

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

export class TsAlarmNotiManagementCtrl {
  private _list: any[];
  set list(list: any[]) {
    this._list = list;
    this.tCalcPaging();
    this.setPageNodes();
    this.$scope.$applyAsync();
  }
  get list() {
    return this._list;
  }

  // Table data model
  tData: TableModel = {
    rowCount: 10,
    selectOpts: [10, 20, 30],
    currPage: 0,
    maxPage: 0,
    maxPageLen: 10,
    pageNode: [],
  };

  /** @ngInject */
  constructor(private $scope: angular.IScope,
    private backendSrv: BackendSrv) {
    this.loadNotifications();
  }

  async loadNotifications() {
    this.list = (await this.backendSrv.get(`/api/alert-notifications`))
      .sort( ({ name }: any, b: any) => name > b.name ? 1 : -1);
  }

  async deleteNotification(id: number) {
    await this.backendSrv.delete(`/api/alert-notifications/${id}`);
    this.list = this.list.filter((noti: any) => noti.id !== id);
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

coreModule.controller('TsAlarmNotiManagementCtrl', TsAlarmNotiManagementCtrl);
