// Grafana libs
// Services
import { getBackendSrv } from '@grafana/runtime';
// Data & Model
import alertDef from 'app/features/alerting/state/alertDef';
import { getShiftedTimeRange } from 'app/core/utils/timePicker';
import { TimeOption, TimeRange, dateMath, toUtc, dateTime } from '@grafana/data';

// common className
export const contClass = 'ts-cont';

export const baseClass = 'ts-alarm-hist';

export const itemClass = `${baseClass}-item`;

export const defaultDateFormat = ['YYYY년', 'MM월', 'DD일', 'a', 'hh시', 'mm분', 'ss초'];


export enum AlarmAPI {
  Annotations = '/thingspin/annotations',
  Confirm = '/thingspin/annotations/confirm',
}

export interface AnnotationQuery {
  from?: number;
  to?: number;
}

export enum AlarmType {
  EMPTY = '',
  ALERT = 'alerting',
  WARNING = 'pending',
  OK = 'ok',
  NO_DATA = 'no_data',
  PAUSE = 'pause',
}

export const alarmOptions: any[] = [
  { value: AlarmType.EMPTY, label: '모두' },
  { value: AlarmType.OK, label: '정상' },
  { value: AlarmType.ALERT, label: '위험' },
  { value: AlarmType.WARNING, label: '경고' },
  { value: AlarmType.PAUSE, label: '정지' },
  { value: AlarmType.NO_DATA, label: '빈 값' },
];

export interface AlarmItem {
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

  uid: string;
  slug: string;
  confirm: boolean;

  // UI Data
  model?: {
    iconClass: string;
    stateClass: string;
    text: string;
  };
  timeStr?: string;
}

export const tsDefaultSelectOptions: TimeOption[] = [
  { from: 'now-1m', to: 'now', display: '1분 전까지', section: 3 },
  { from: 'now-3m', to: 'now', display: '3분 전까지', section: 3 },
  { from: 'now-5m', to: 'now', display: '5분 전까지', section: 3 },
  { from: 'now-15m', to: 'now', display: '15분 전까지', section: 3 },
  { from: 'now-30m', to: 'now', display: '30분 전까지', section: 3 },
  { from: 'now-1h', to: 'now', display: '1시간 전까지', section: 3 },
  { from: 'now-3h', to: 'now', display: '3시간 전까지', section: 3 },
  { from: 'now-6h', to: 'now', display: '6시간 전까지', section: 3 },
  { from: 'now-12h', to: 'now', display: '12시간 전까지', section: 3 },
  { from: 'now-24h', to: 'now', display: '하루 전까지', section: 3 },
  { from: 'now-2d', to: 'now', display: '2일 전까지', section: 3 },
  { from: 'now-7d', to: 'now', display: '7일 전까지', section: 3 },
  { from: 'now-30d', to: 'now', display: '30일 전까지', section: 3 },
  { from: 'now-90d', to: 'now', display: '90일 전까지', section: 3 },
  { from: 'now-6M', to: 'now', display: '6개월 전까지', section: 3 },
  { from: 'now-1y', to: 'now', display: '1년 전까지', section: 3 },
  { from: 'now-2y', to: 'now', display: '2년 전까지', section: 3 },
  { from: 'now-5y', to: 'now', display: '5년 전까지', section: 3 },
  { from: 'now-1d/d', to: 'now-1d/d', display: '어제 하루', section: 3 },
  { from: 'now-2d/d', to: 'now-2d/d', display: '그저께 하루', section: 3 },
  { from: 'now-7d/d', to: 'now-7d/d', display: '지난 주 해당 요일', section: 3 },
  { from: 'now-1w/w', to: 'now-1w/w', display: '저번 주 전체', section: 3 },
  { from: 'now-1M/M', to: 'now-1M/M', display: '1달 전 전체', section: 3 },
  { from: 'now-1y/y', to: 'now-1y/y', display: '1년 전 전체', section: 3 },
  { from: 'now/d', to: 'now/d', display: '오늘', section: 3 },
  { from: 'now/d', to: 'now', display: '오늘까지', section: 3 },
  { from: 'now/w', to: 'now/w', display: '이번 주', section: 3 },
  { from: 'now/w', to: 'now', display: '이번 주까지', section: 3 },
  { from: 'now/M', to: 'now/M', display: '이번 달', section: 3 },
  { from: 'now/M', to: 'now', display: '이번 달까지', section: 3 },
  { from: 'now/y', to: 'now/y', display: '올해', section: 3 },
  { from: 'now/y', to: 'now', display: '올해까지', section: 3 },
];

export function genTimeRange(from = 'now-24h', to = 'now'): TimeRange {
  // make copies if they are moment  (do not want to return out internal moment, because they are mutable!)
  return {
    from: dateMath.parse(from, false),
    to: dateMath.parse(to, true),
    raw: {
      from,
      to,
    },
  };
}

export function shiftTime(range: TimeRange, direction = 1) {
  const { from, to } = getShiftedTimeRange(direction, range);
  return {
    from: toUtc(from),
    to: toUtc(to),
    raw: range.raw,
  };
}

export function genAlarmItem(item: AlarmItem): AlarmItem {
  const timeStr = dateTime(item.time).fromNow(true);
  const { iconClass, stateClass, text } = alertDef.getStateDisplayModel(item.newState);

  return {
    ...item,
    model: {
      text,
      iconClass: iconClass.replace('alert', 'alarm'),
      stateClass: stateClass.replace('alert', 'alarm'),
    },
    timeStr,
  };
}

export const fetchHistory = async (
  params?: AnnotationQuery,
  newState?: AlarmType,
  confirm?: boolean,
  limit = 100000,
): Promise<AlarmItem[]> => (
  await getBackendSrv().get(AlarmAPI.Annotations, { ...params, limit, type: 'alerting', confirm, newState })
).map(genAlarmItem);
