export enum AlarmAPI {
  Annotations = '/thingspin/annotations',
  Confirm = '/thingspin/annotations/confirm'
}

export enum AlarmConfirm {
  Confirm = 'TRUE',
  Unconfirm = 'FALSE',
}

export interface AlarmHistoryPayload {
  id: number;
  alertId: number;
  alertName: string;
  dashboardId: number;
  panelId: number;
  userId: number;
  newState: string;
  prevState: string;
  created: number | Date;
  updated: number | Date;
  time: number | Date;
  timeEnd: number | Date;
  text: string;
  tags: any[];
  login: string;
  email: string;
  avvatarUrl: string;
  data: any;

  // thingpsin add field----
  confirm: boolean;
  confirmDate: number | Date;
  uid: string;
  slug: string;
}

export interface Simulator {
  title: string;
  subtitle?: string;
  time: string | number | Date;
  alarmType: string;
  historyType: string;
  history: object;
}

export interface AlarmPayload extends Simulator {
  id: number;
  evalMatches: any[];
  conditionEvals: string;
  ruleUrl: string;
}

export interface WsStream {
  Stream: string;
  data: AlarmPayload;
}
