// 3rd party libs
import _ from "lodash";

// Grafana libs
import { appEvents } from 'app/core/core';
import { AppEvents } from '@grafana/data';
import { coreModule, NavModelSrv } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import './notificationsEditCtrl';
import "./index.scss";

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
  //notifications: any;
  navModel: any;
  list: any;
  tData: TableModel = {
      rowCount: 10,
      selectOpts: [10, 20, 30],
      currPage: 0,
      maxPage: 0,
      maxPageLen: 10,
      pageNode: [],
  };
  name: string;
  type: string;

  /** @ngInject */
  constructor(private backendSrv: BackendSrv, navModelSrv: NavModelSrv) {
    this.loadNotifications();
    this.navModel = navModelSrv.getNav('alerting', 'channels', 0);
    this.list = [];
  }

  loadNotifications() {
    this.backendSrv.get(`/api/alert-notifications`).then((result: any) => {
      this.list = result.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1);
      this.tCalcPaging();
      this.setPageNodes();
    });
  }

  deleteNotification(id: number) {
    console.log("delete = " + id);
    this.backendSrv.delete(`/api/alert-notifications/${id}`).then(() => {
      this.list = this.list.filter((notification: any) => {
        return notification.id !== id;
      });
      this.list = this.list.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1);
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

  openAlartNotification(value: any) {
      appEvents.emit(AppEvents.alertError, [value]);
  }
}

coreModule.controller('TsAlarmNotiManagementCtrl', TsAlarmNotiManagementCtrl);
