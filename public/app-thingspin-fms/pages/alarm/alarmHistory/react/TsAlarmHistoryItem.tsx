// js 3rd party libs
import React from 'react';
// @ts-ignore
import Highlighter from 'react-highlight-words';

// grafana libs
import { dateTime } from '@grafana/data';

// thingspin libs
import { AlarmItem, itemClass as icls, defaultDateFormat } from '../types';
import { genRuleUrl } from 'app-thingspin-fms/react/components/RightSidebar/FmsAlarmBand/models';

export interface TsAlarmHistoryItemProps {
  item: AlarmItem;
  search: string;
}

export const TsAlarmHistoryItem: React.FC<TsAlarmHistoryItemProps> = ({
  item: {
    model: { stateClass, iconClass, text },
    alertName,
    data,
    timeStr,
    time,
    uid,
    slug,
  },
  search,
}) => (<li className={icls}>
  <div className={`${icls}__info`}>
    <span className={`${icls}__icon ${stateClass}`}>
      <i className={iconClass} />
    </span>

    <div className={`${icls}__body`}>
      <div className={`${icls}__header`}>

        <div className={`${icls}__name`}>
          <span>
            <Highlighter
              highlightClassName="highlight-search-match"
              textToHighlight={alertName}
              searchWords={[search]}
            />
          </span>
        </div>

        <div className={`${icls}__text`}>
          <span className={`${icls}__status ${stateClass}`}>{text}</span>

          <span className={`${icls}__time`}>
            <span className={`${icls}__time_for`}>For</span>
            {timeStr}
          </span>
        </div>

      </div>
    </div>

  </div>

  {
    JSON.stringify(data) !== JSON.stringify({}) && data.evalMatches
      ? data.evalMatches.map(({ metric, value }: any, idx: number) => (
        <div className={`${icls}__info`} key={idx}>
          <div className={`${icls}__body`}>
            <div className={`${icls}__header`}>
              <div className={`${icls}__text`}>
                <span>{metric}</span>
              </div>
              <div className={`${icls}__name`}>
                {value}
              </div>
            </div>
          </div>
        </div>
      ))
      : <div className={`${icls}__info`}></div>
  }


  <div className={`${icls}__actions`}>

    <div className={`${icls}__body`}>
      {dateTime(time).format(defaultDateFormat.join(' '))}
    </div>

    <a className={`${icls}__link`} href={genRuleUrl(uid, slug, time)} >
      상세보기
      </a>
  </div>
</li>);

export default TsAlarmHistoryItem;
