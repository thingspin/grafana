// 3rd party libs
import { IQService } from 'angular';
import _ from 'lodash';

// grafana libs
import { BackendSrv } from 'app/core/services/backend_srv';
import { TemplateSrv } from 'app/features/templating/template_srv';
import { DataQueryRequest, DataSourceInstanceSettings, DataSourceApi, DataQueryResponse, MetricFindValue } from '@grafana/ui';

// grafana plugin libs
import { InfluxQuery } from 'app/plugins/datasource/influxdb/types';
import InfluxDatasource from 'app/plugins/datasource/influxdb/datasource';

// thingpsin plugin libs
import { TsDsTarget } from '../../models/index';
import { setTsPluginBackendSrv, getDatasourceByName, } from '../../utils/backendCtrl';

export class FmsDatasource extends DataSourceApi<TsDsTarget> {
  datasourceName = `_storage`;
  influxInst: InfluxDatasource;

  /** @ngInject */
  constructor(private backendSrv: BackendSrv, private $q: IQService, private templateSrv: TemplateSrv,
    instanceSettings: DataSourceInstanceSettings,
  ) {
    super(instanceSettings);
    setTsPluginBackendSrv(backendSrv);
    this.initFms(instanceSettings);
  }

  async initFms(instanceSettings: DataSourceInstanceSettings) {
    try {
      const dsInfo = await getDatasourceByName(this.datasourceName);

      instanceSettings.database = 'thingspin';
      instanceSettings.url = `/thingspin/datasources/proxy/${dsInfo.id}`;

      this.influxInst = new InfluxDatasource(instanceSettings as any, this.$q, this.backendSrv, this.templateSrv);
    } catch (e) {
      console.error(e);
    }
  }

  generateInfluxQueries(options: DataQueryRequest<TsDsTarget>): InfluxQuery[] {
    const targets: InfluxQuery[] = [];

    const measurementGroup: any = {};
    const getMeasurement = (measurement: string, refId: string): InfluxQuery => {
      let obj: InfluxQuery = measurementGroup[measurement];

      if (!obj) {
        obj = {
          refId, measurement, select: [],
          // force setting property
          alias: '$col',
        } as any;
        measurementGroup[measurement] = obj;
      }

      return obj;
    };

    for (const target of options.targets) {
      if (Array.isArray(target.tagNodes)) {
        for (const tagNode of target.tagNodes) {
          const { // js renaming
            tag_table_name: measurement,
            tag_column_name: columnName,
            tag_name: aliasName
          } = tagNode;
          const iq = getMeasurement(measurement, target.refId);

          iq.select.push([
            { type: 'field', params: [columnName] },  //select columnName <-
            { type: 'mean', params: [] }, //select mean(columnName) <-
            { type: 'alias', params: [aliasName] } // select mean(columnName) as aliasName <-
          ]);
        }
      }
    }

    for (const measurement in measurementGroup) {
      targets.push(measurementGroup[measurement]);
    }

    return targets.length ? targets : options.targets;
  }

  // implementation
  query(options: DataQueryRequest<TsDsTarget>): Promise<DataQueryResponse> {
    if (!this.influxInst) {
      return Promise.resolve({ data: [] });
    }

    const targets = this.generateInfluxQueries(options);
    options.targets = (targets as any);

    return this.influxInst.query(options);
  }

  // implementation
  metricFindQuery(_options: any): Promise<MetricFindValue[]> {
    return Promise.resolve([]);
  }

  // implementation
  testDatasource(): Promise<any> {
    return this.influxInst.testDatasource();
  }
}
