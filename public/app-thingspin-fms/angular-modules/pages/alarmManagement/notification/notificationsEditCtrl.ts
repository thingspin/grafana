// js 3rd party libs
import _ from 'lodash';

// Grafna libs
import { AppEvents } from '@grafana/data';
import { appEvents, coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';

// Thingspin libs
import "./index.scss";

export class TsAlarmNotiEditCtrl {
  theForm: any;
  //navModel: any;
  testSeverity = 'critical';
  notifiers: any;
  notifierTemplateId: string;
  isNew: boolean;
  model: any;
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
  getFrequencySuggestion: any;

  /** @ngInject */
  constructor(
    private $routeParams: any,
    private backendSrv: BackendSrv,
    private $location: any,
    private $templateCache: any,
  ) {
    this.isNew = !this.$routeParams.id;

    this.getFrequencySuggestion = () => {
      return ['1m', '5m', '10m', '15m', '30m', '1h'];
    };

    this.backendSrv
      .get(`/thingspin/alert-notifiers`)
      .then((notifiers: any) => {
        this.notifiers = notifiers;

        // add option templates
        for (const notifier of this.notifiers) {
          this.$templateCache.put(this.getNotifierTemplateId(notifier.type), notifier.optionsTemplate);
        }

        if (!this.$routeParams.id) {
          return _.defaults(this.model, this.defaults);
        }

        return this.backendSrv.get(`/api/alert-notifications/${this.$routeParams.id}`).then((result: any) => {
          result.settings = _.defaults(result.settings, this.defaults.settings);
          return result;
        });
      })
      .then((model: any) => {
        this.model = model;
        this.notifierTemplateId = this.getNotifierTemplateId(this.model.type);
      });
  }

  save() {
    if (!this.theForm.$valid) {
      return;
    }

    if (this.model.id) {
      this.backendSrv
        .put(`/api/alert-notifications/${this.model.id}`, this.model)
        .then((res: any) => {
          this.model = res;
          appEvents.emit(AppEvents.alertSuccess, ['Notification updated', '']);
        })
        .catch((err: any) => {
          if (err.data && err.data.error) {
            appEvents.emit(AppEvents.alertError, [err.data.error]);
          }
        });
    } else {
      this.backendSrv
        .post(`/api/alert-notifications`, this.model)
        .then((res: any) => {
          appEvents.emit(AppEvents.alertSuccess, ['Notification created', '']);
          this.$location.path('thingspin/alarm/notification');
        })
        .catch((err: any) => {
          if (err.data && err.data.error) {
            appEvents.emit(AppEvents.alertError, [err.data.error]);
          }
        });
    }
  }

  getNotifierTemplateId(type: string) {
    return `notifier-options-${type}`;
  }

  typeChanged() {
    this.model.settings = _.defaults({}, this.defaults.settings);
    this.notifierTemplateId = this.getNotifierTemplateId(this.model.type);
  }

  testNotification() {
    if (!this.theForm.$valid) {
      return;
    }

    const payload = {
      name: this.model.name,
      type: this.model.type,
      frequency: this.model.frequency,
      settings: this.model.settings,
    };

    this.backendSrv.post(`/api/alert-notifications/test`, payload).then((res: any) => {
      appEvents.emit(AppEvents.alertSuccess, ['Test notification sent', '']);
    });
  }
}

coreModule.controller('TsAlarmNotiEditCtrl', TsAlarmNotiEditCtrl);
