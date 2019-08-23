import { ReactNode } from 'react';

export enum FacilityTreeType {
  Ptag = "ptag",
  Site = "site"
}

export interface FilterTreeProps {
  nodes: any[];
  nodesChecked: any[];
  click?: Function;
}

export interface SiteOptions {
  value: any;
  label: any;
  isCustom: boolean;
  icon: ReactNode;
}

export interface FilterTreeState {
  checked: [];
  prevChecked: [];
  expanded: [];
  filterText: any;
  nodesFiltered: any;
  nodes: any;

  filterPlaceholder: any;
}

export type facilityTreeProps = {
  click?: Function;
  inject: angular.auto.IInjectorService; // for route
  taginfo: any;
  siteinfo: any;
};

export interface FacilityItem {
  Taginfo: any[];
  checked: any[];
  testChecked?: any[];

  nodes: any[];
  selectedOption?: SiteOptions;

  sitesListinfo: any[];
  siteOptions: siteData[];

  checkedSave: any[];
  connectionList: connectData[];
}

export type TreeInfo = FacilityItem | null;

//for select--------
// tslint:disable-next-line:class-name
export interface siteData {
  value: any;
  label: any;
}
//-----------------select
// tslint:disable-next-line:class-name
export interface connectData {
  flowId: any;
  connId: any;
  connState: any;
  influxState: any;
}
