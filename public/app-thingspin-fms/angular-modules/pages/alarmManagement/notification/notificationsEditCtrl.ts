// js 3rd party libs
import _ from 'lodash';

// Grafna libs
import { AppEvents } from '@grafana/data';
import { appEvents, coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import "./index.scss";


function getNotifierTemplateId(type: string) {
  return `notifier-options-${type}`;
}

export class TsAlarmNotiEditCtrl {
  model: any;
  theForm: angular.IFormController;
  notifiers: any[] = [];
  notifierTemplateId: string;

  testSeverity = 'critical';
  defaults: any = {
    type: 'email',
    sendReminder: false,
    disableResolveMessage: false,
    frequency: '15m',
    settings: {
      httpMethod: 'POST',
      autoResolve: true,
      uploadImage: true,
    },
    isDefault: false,
  };
  isNew = !this.$routeParams.id;

  getFrequencySuggestion = () => {
    return ['1m', '5m', '10m', '15m', '30m', '1h'];
  };

  /** @ngInject */
  constructor(
    private $scope: angular.IScope,
    private $routeParams: any,
    private backendSrv: BackendSrv,
    private $location: angular.ILocationService,
    private $templateCache: angular.ITemplateCacheService,
  ) {
    this.init();
  }

  async init() {
    this.notifiers = await this.backendSrv.get(`/thingspin/alert-notifiers`);

    // add option templates
    for (const { type, optionsTemplate } of this.notifiers) {
      this.$templateCache.put(getNotifierTemplateId(type), optionsTemplate);
    }

    let model;
    if (!this.$routeParams.id) {
      model = _.defaults(this.model, this.defaults);
    } else {
      model = await this.backendSrv.get(`/api/alert-notifications/${this.$routeParams.id}`);
      model.settings = _.defaults(model.settings, this.defaults.settings);
    }

    this.model = model;
    this.notifierTemplateId = getNotifierTemplateId(this.model.type);
    this.$scope.$applyAsync();
  }

  async save() {
    if (!this.theForm.$valid) {
      return;
    }

    try {
      const { id } = this.model;
      if (id) {
        this.model = await this.backendSrv.put(`/api/alert-notifications/${id}`, this.model);

        appEvents.emit(AppEvents.alertSuccess, ['Notification updated', '']);
      } else {
        await this.backendSrv.post(`/api/alert-notifications`, this.model);

        appEvents.emit(AppEvents.alertSuccess, ['Notification created', '']);
        this.$location.path('thingspin/alarm/notification');
      }
    } catch (err) {
      if (err.data && err.data.error) {
        appEvents.emit(AppEvents.alertError, [err.data.error]);
      }
    }
    this.$scope.$applyAsync();
  }

  typeChanged() {
    this.model.settings = _.defaults({}, this.defaults.settings);
    this.notifierTemplateId = getNotifierTemplateId(this.model.type);
  }

  async testNotification() {
    if (!this.theForm.$valid) {
      return;
    }

    const { name, type, frequency, settings } = this.model;
    await this.backendSrv.post(`/api/alert-notifications/test`, { name, type, frequency, settings, });

    appEvents.emit(AppEvents.alertSuccess, ['Test notification sent', '']);
    this.$scope.$applyAsync();
  }
}

coreModule.controller('TsAlarmNotiEditCtrl', TsAlarmNotiEditCtrl);
