// 3rd party libs
import _ from 'lodash';

// Grafana libs
// Models
import { coreModule } from 'app/core/core';
import { AlertTabCtrl } from 'app/features/alerting/AlertTabCtrl';
import { BackendSrv } from 'app/core/services/backend_srv';
import { DashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import DatasourceSrv from 'app/features/plugins/datasource_srv';
import config from 'app/core/config';
import { ThresholdMapper } from 'app/features/alerting/state/ThresholdMapper';

// ThingSPIN libs
// Modes
import { tsEvalFunctions, tsReducerTypes, tsEvalOperators } from '../../utils';
// Views
import alertDef from 'app/features/alerting/state/alertDef';

export interface Tag {
  value: any;
  label: any;
  [v: string]: any;
}

export interface TagTree {
  siteData: {
    value: any;
    label: any;
    [v: string]: any;
  };
  Taginfo: Tag[];
}

export class TsAlertTabCtrl extends AlertTabCtrl implements angular.IController {
  // redefine AlertTabCtrl Constructor params
  protected _$scope: any;
  protected _backendSrv: BackendSrv;
  protected _dashboardSrv: DashboardSrv;
  protected _uiSegmentSrv: any;
  protected _$q: any;
  protected _datasourceSrv: DatasourceSrv;

  /** @ngInject */
  constructor(
    $scope: any,
    backendSrv: BackendSrv,
    dashboardSrv: DashboardSrv,
    uiSegmentSrv: any,
    $q: any,
    datasourceSrv: DatasourceSrv) {
    super($scope, backendSrv, dashboardSrv, uiSegmentSrv, $q, datasourceSrv);

    this._$scope = $scope;
    this._backendSrv = backendSrv;
    this._dashboardSrv = dashboardSrv;
    this._uiSegmentSrv = uiSegmentSrv;
    this._datasourceSrv = datasourceSrv;
    this._$q = $q;

    this.evalFunctions = tsEvalFunctions;
    this.evalOperators = tsEvalOperators;
  }

  // Override
  buildDefaultCondition(label = 'A', from = '5m') {
    return {
      type: 'query',
      query: { params: [label, from, 'now'] },
      reducer: { type: 'avg', params: [] as any[] },
      evaluator: { type: 'gt', params: [null] as any[] },
      operator: { type: 'or' },
    };
  }

  // Redefine addCondition()
  tsAddCondition(label: string) {
    const condition = this.buildDefaultCondition(label);
    // add to persited model
    this.alert.conditions.push(condition);
    // add to view model
    this.conditionModels.push(this.buildConditionModel(condition));
  }

  // ThingSPIN new method
  tsUpdateAlarm = ({Taginfo}: TagTree) => {
    // clear data
    this.alert.conditions = [];
    this.conditionModels = [];
    this.conditionTypes = [];

    // add condition
    for (const { label } of Taginfo) {
      const condition = this.buildDefaultCondition(label);
      // add to persited model
      this.alert.conditions.push(condition);
      // add to view model
      this.conditionModels.push(this.buildConditionModel(condition));

      //
      this.conditionTypes.push({
        text: label,
        value: label,
      });
    }

    this._$scope.$apply();
  }

  // Override
  handleReducerPartEvent(conditionModel: any, { name, action }: any) {
    const { reducer } = conditionModel.source;
    switch (name) {
      case 'action': {
        reducer.type = action.value;
        conditionModel.reducerPart = alertDef.createReducerPart(reducer);
        break;
      }
      case 'get-part-actions': {
        const result = tsReducerTypes.filter(({ value }) => value !== reducer.type);
        return this._$q.when(result);
      }
    }
  }


  // Override
  $onInit() {
    if (this.panelCtrl) {
      this.panelCtrl.events.on('ts-update-alarm', this.tsUpdateAlarm);
    }

    return super.$onInit();
  }

  // Override
  initModel() {
    const alert = (this.alert = this.panel.alert);
    if (!alert) {
      return;
    }

    alert.conditions = alert.conditions || [];
    alert.noDataState = alert.noDataState || config.alertingNoDataOrNullValues;
    alert.executionErrorState = alert.executionErrorState || config.alertingErrorOrTimeout;
    alert.frequency = alert.frequency || '1m';
    alert.handler = alert.handler || 1;
    alert.notifications = alert.notifications || [];
    alert.for = alert.for || '0m';
    alert.alertRuleTags = alert.alertRuleTags || {};
    alert.name = alert.name || `${this.panel.title} alert`;

    this.conditionModels = _.reduce(
      alert.conditions,
      (memo, value) => {
        memo.push(this.buildConditionModel(value));
        return memo;
      },
      []
    );

    ThresholdMapper.alertToGraphThresholds(this.panel);

    for (const { uid, id } of alert.notifications) {
      // lookup notifier type by uid
      let model: any = _.find(this.notifications, { uid });

      // fallback to using id if uid is missing
      if (!model) {
        model = _.find(this.notifications, { id });
      }

      if (model && model.isDefault === false) {
        model.iconClass = this.getNotificationIcon(model.type);
        this.alertNotifications.push(model);
      }
    }

    for (const notification of this.notifications) {
      if (notification.isDefault) {
        notification.iconClass = this.getNotificationIcon(notification.type);
        notification.bgColor = '#00678b';
        this.alertNotifications.push(notification);
      }
    }

    this.panelCtrl.editingThresholds = true;
    this.panelCtrl.render();
  }
}

export class TsAlertTab implements angular.IDirective {
  templateUrl = require('./tsAlertTab.html');
  restrict = 'E';
  scope = true;
  controller = TsAlertTabCtrl;
}

coreModule.directive('tsAlertTab', [() => new TsAlertTab()]);
