// 3rd party libs
import { IQService } from 'angular';
import _ from 'lodash';

// grafana libs
import { BackendSrv } from 'app/core/services/backend_srv';
import { TemplateSrv } from 'app/features/templating/template_srv';
import { DataQueryRequest, DataSourceInstanceSettings, DataSourceApi, DataQueryResponse, MetricFindValue } from '@grafana/data';

// grafana plugin libs
import { InfluxQuery } from 'app/plugins/datasource/influxdb/types';
import InfluxDatasource from 'app/plugins/datasource/influxdb/datasource';

// thingpsin plugin libs
import { TsDsTarget } from '../../models';
import { setTsPluginBackendSrv, getDatasourceByName, } from '../../utils/backendCtrl';

export class FmsDatasource extends DataSourceApi<TsDsTarget> {
  datasourceName = `_storage`;
  influxInst: InfluxDatasource;

  /** @ngInject */
  constructor(instanceSettings: DataSourceInstanceSettings,
    private $q: IQService, private backendSrv: BackendSrv, private templateSrv: TemplateSrv,
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

    for (const { tagNodes, refId } of options.targets) {
      if (Array.isArray(tagNodes)) {
        for (const { tag_table_name, tag_column_name, tag_name } of tagNodes) {
          const iq = getMeasurement(tag_table_name, refId);

          iq.select.push([
            { type: 'field', params: [tag_column_name] },  //select columnName <-
            { type: 'mean', params: [] }, //select mean(columnName) <-
            { type: 'alias', params: [tag_name] } // select mean(columnName) as aliasName <-
          ]);
        }
      }
    }

    const targets: InfluxQuery[] = [];
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

    options.targets = this.generateInfluxQueries(options) as any;

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
