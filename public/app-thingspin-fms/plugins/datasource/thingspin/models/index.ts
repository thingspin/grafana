// grafana plugin libs
import { InfluxQuery } from 'app/plugins/datasource/influxdb/types';

// thingspin core libs
import { TreeNodeShape } from 'app-thingspin-fms/react/components/react-checkbox-tree/models';

export interface TsSite {
  id: number;
  name: string;
  desc: string;
  lat: number;
  lon: number;
}

export interface TsTree extends TreeNodeShape {
  // site properties
  site_id: number;

  // facility properties
  facility_id?: number;
  facility_desc?: string;
  facility_name?: string;
  facility_lat?: number;
  facility_lon?: number;
  facility_path?: string;

  // tag properties
  tag_id?: number;
  tag_datasource?: number;
  tag_table_name?: string;
  tag_column_nmae?: string;
  tag_column_type?: string;
  tag_name?: string;

  // tag tree properties
  facility_tree_path?: string;
  facility_tree_order?: number;
  facility_tree_id?: number;

  // override TreeNodeShape properties
  children: TsTree[];
  label: string;
  value: string;
}

export interface TsDsTarget extends InfluxQuery {
  siteId?: number;
  checked?: any[];
  tagNodes: TsTree[];
}

export interface RcQueryCtrlProps {
  target: TsDsTarget;
  onChange: (target: object) => void;
}

export interface RcQueryCtrlStates {
  // share data
  expanded: any[];
  treeData: TsTree[];
  sites: TsSite[];
}

export type ReactDirective = (reactComponentName: any, props: any[], conf?: any, injectableProps?: any) => any;
