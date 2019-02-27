import { EPermission } from './common';

export interface TsIMenuItem {
  title: string;
  url: string;
  params: any;
  order: number;
  extern: boolean;
  target: string;
  perm: EPermission;
  navPath: string[];
  isShow: boolean;
}
export interface TsIMenuLv1 extends TsIMenuItem {
  pinEnabled: boolean;
  pisDisplay: boolean;
  arrow: boolean;
  icon: string;
  hasChild: TsIMenuItem[];
  maxChildren: number;
}
