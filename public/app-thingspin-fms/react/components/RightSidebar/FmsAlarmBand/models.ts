// Grafana libs
import { getBackendSrv } from '@grafana/runtime';
import { DurationUnit, dateTime } from '@grafana/data';

// Thingspin libs
import { AnnotationQuery, AlarmType } from 'app-thingspin-fms/pages/alarm/alarmHistory/types';
import { AlarmConfirm, AlarmHistoryPayload, AlarmAPI, AlarmPayload } from './types';
import { TS_ALARM_TYPE } from '../FmsHistoryCard';

export function convAlarmType(type: string) {
  switch (type) {
    case AlarmType.ALERT:
    case TS_ALARM_TYPE.ERROR:
      return TS_ALARM_TYPE.ERROR;
    case AlarmType.WARNING:
    case TS_ALARM_TYPE.WARNING:
      return TS_ALARM_TYPE.WARNING;
    default:
      return TS_ALARM_TYPE.NORMAL;
  }
}

export const fetchHistory = async (newState: AlarmType, params?: AnnotationQuery,
  confirm = AlarmConfirm.Unconfirm,
  limit = 100000,
  type = AlarmType.ALERT,
): Promise<AlarmHistoryPayload[]> => (
    getBackendSrv().get(AlarmAPI.Annotations, { ...params, limit, type, newState, confirm })
  );

export async function fetchAlarms(from: number, to: number, types = [AlarmType.ALERT], checked = false) {
  const confirm = checked ? AlarmConfirm.Confirm : AlarmConfirm.Unconfirm;
  const histories = (await Promise.all(types.map((type) => fetchHistory(type, { from, to }, confirm))))
    .reduce((parentArr, childArr) => {
      parentArr.push(...childArr);
      return parentArr;
    }, []);

  return histories
    .sort((a, b) => dateTime(b.time).valueOf() - dateTime(a.time).valueOf()) // sorting
    .map(convAlarmPayload);
}

export function setFieldData(origin: AlarmPayload) {
  // convert history
  if (Array.isArray(origin.evalMatches)) {
    origin.history = origin.evalMatches.reduce((acc: any, { metric, value }: any) => {
      acc['알람 발생 태그'] = metric;
      acc['알람 발생 값'] = value;

      return acc;
    }, {});
  }

  // convert url
  try {
    const url = new URL(origin.ruleUrl.replace('/d/', '/thingspin/alarm/edit/'));
    origin.ruleUrl = url.pathname;
  } catch (e) { }

  return origin;
}

export function convAlarmPayload({ newState, alertName: title, data: { evalMatches }, time, uid, slug }: AlarmHistoryPayload): AlarmPayload {
  const alarmType = convAlarmType(newState);

  return {
    time,
    title,
    alarmType,
    evalMatches,

    history: {},
    conditionEvals: '',
    historyType: alarmType,
    ruleUrl: genRuleUrl(uid, slug, time),
  };
}

export function genRuleUrl(uid: string, slug: string, time: any, range = 10, unit: DurationUnit = 'second') {
  const from = dateTime(time).subtract(range, unit).valueOf();
  const to = dateTime(time).add(range, unit).valueOf();
  return `/thingspin/alarm/edit/${uid}/${slug}?from=${from}&to=${to}`;
}
