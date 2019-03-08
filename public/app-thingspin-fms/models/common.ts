export enum EViewModeState {
  Mode0 = 0,
  Mode1 = 1,
  Mode2 = 2,
}

export enum EPermission {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export interface TsBaseProps {
  $injector: any;
  $route: any;
  $rootScope: any;
}
