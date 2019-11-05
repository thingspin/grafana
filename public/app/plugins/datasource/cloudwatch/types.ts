import { DataQuery } from '@grafana/data';

export interface CloudWatchQuery extends DataQuery {
  id: string;
  region: string;
  namespace: string;
  metricName: string;
  dimensions: { [key: string]: string };
  statistics: string[];
  period: string;
  expression: string;
}
