// Grafana libs
import { getBackendSrv } from '@grafana/runtime';

// Thingspin libs
import { AnnotationQuery, AlarmType } from 'app-thingspin-fms/pages/alarm/alarmHistory/types';
import { AlarmConfirm, AlarmHistoryPayload, AlarmAPI, AlarmPayload } from './types';
import { TS_ALARM_TYPE } from '../FmsHistoryCard';

export function getAlarmType(type: string): TS_ALARM_TYPE {
  switch (type) {
    case TS_ALARM_TYPE.WARNING:
      return TS_ALARM_TYPE.WARNING;
    case TS_ALARM_TYPE.ERROR:
      return TS_ALARM_TYPE.ERROR;
    default:
      return TS_ALARM_TYPE.NORMAL;
  }
}

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
  } catch (e) {
  }
  return origin;
}

