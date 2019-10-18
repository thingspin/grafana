// js 3rd party libs
import React, { useState } from 'react';

// Grafana libs
import { dateTime } from '@grafana/data';

// Thingspin libs
import { TS_HISTORY_TYPE } from '../FmsHistoryCard/Card';
import FmsHistoryCard, { TS_ALARM_TYPE } from '../FmsHistoryCard';
import { AlarmPayload } from '../FmsAlarmBand/types';

export interface Props {
  list: AlarmPayload[];
  checked: boolean;
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

export const TsRightSideHistoryComponent: React.FC<Props> = ({ list, checked }) => {

  const [deactives, setDeactives] = useState([] as any[]);

  const onDeactiveHistory = (history: any) => {
    deactives.push(history);
    if (!checked) {
      setDeactives([...deactives]);
    }
  };

  return <>
    <div className="ts-right-side-history-component">
      {list
        .filter(({ history }) => checked ? true : !deactives.includes(history))
        .map(({ id, title, subtitle, time, alarmType, history, ruleUrl }: AlarmPayload, idx: number) =>
          <FmsHistoryCard key={idx}
            id={id}
            title={title}
            subtitle={subtitle}
            history={history}
            convTime={dateTime(time)}
            link={ruleUrl}
            time={time}

            isActive={true}
            alarmType={getAlarmType(alarmType)}
            historyType={TS_HISTORY_TYPE.ALARM}
            onDeactiveHistory={onDeactiveHistory}
          />
        )}
    </div>
  </>;
};
