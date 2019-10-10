// js 3rd party libs
import React from 'react';

// Grafana libs
import { dateTime } from '@grafana/data';

// Thingspin libs
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import FmsHistoryCard, { TS_ALARM_TYPE } from '../FmsHistoryCard';
import { AlarmPayload } from '../FmsAlarmBand/types';

export interface Props {
  list: AlarmPayload[];
}

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

export const TsRightSideHistoryComponent: React.FC<Props> = ({ list }) => (
<>
  <div className="ts-right-side-history-component">
    {list.map(({ title, subtitle, time, alarmType, history, ruleUrl }: AlarmPayload, idx: number) =>
      <FmsHistoryCard key={idx}
        title={title}
        subtitle={subtitle}
        history={history}
        time={dateTime(time)}
        link={ruleUrl}

        isActive={true}
        alarmType={getAlarmType(alarmType)}
        historyType={TS_HISTORY_TYPE.ALARM}
      />
    )}
  </div>
</>);
