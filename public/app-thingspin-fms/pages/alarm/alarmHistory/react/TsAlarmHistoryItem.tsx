// js 3rd party libs
import React, { ReactNode } from 'react';
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

export const genBodyView = (nameContent?: ReactNode, textContent?: ReactNode) => (
  <div className={`${icls}__body`}>
    <div className={`${icls}__header`}>
      {nameContent && <div className={`${icls}__name`}>
        {nameContent}
      </div>}
      {textContent && <div className={`${icls}__text`}>
        {textContent}
      </div>}
    </div>
  </div>
);

export const TsAlarmHistoryItem: React.FC<TsAlarmHistoryItemProps> = ({
  item: {
    model: { stateClass, iconClass, text },
    alertName,
    data,
    timeStr,
    time,
    uid,
    slug,
    confirm,
  },
  search,
}) => (<li className={icls}>
  <div className={`${icls}__info`}>
    <span className={`${icls}__icon ${!confirm && stateClass}`}>
      <i className={iconClass} />
    </span>

    {genBodyView(
      <span>
        <Highlighter
          highlightClassName="highlight-search-match"
          textToHighlight={alertName}
          searchWords={[search]}
        />
      </span>,
      <>
        <span className={`${icls}__status ${!confirm && stateClass}`}>{text}</span>
        <span className={`${icls}__time`}>
          <span className={`${icls}__time_for`}>For</span>
          {timeStr}
        </span>
      </>
    )}
  </div>

  <div className={`${icls}__info`}>
    {
      JSON.stringify(data) !== JSON.stringify({}) && data.evalMatches
        ? data.evalMatches.map(({ metric, value }: any, idx: number) => (
          <div className={`${icls}__metric`} key={idx}>
            {genBodyView(
              <span>{metric}</span>,
              value)}
          </div>
        ))
        : <div className={`${icls}__metric`}>{genBodyView('빈 값')}</div>
    }

  </div>

  <div className={`${icls}__info`}>
    <div className={`${icls}__etc`}>
      {genBodyView(
        <span>발생 시간</span>,
        dateTime(time).format(defaultDateFormat.join(' '))
      )}
    </div>

    <div className={`${icls}__etc`}>
      {genBodyView(
        <a className={`${icls}__link`} href={genRuleUrl(uid, slug, time)} >
          상세보기
          </a>
      )}
    </div>
  </div>
</li>);

export default TsAlarmHistoryItem;
