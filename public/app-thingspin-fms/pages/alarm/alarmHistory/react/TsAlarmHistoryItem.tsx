// js 3rd party libs
import React from 'react';
// @ts-ignore
import Highlighter from 'react-highlight-words';

// grafana libs
import { dateTime } from '@grafana/data';

// thingspin libs
import { AlarmItem, itemClass as icls, defaultDateFormat } from '../types';

export interface TsAlarmHistoryItemProps {
  item: AlarmItem;
  search: string;
}

export class TsAlarmHistoryItem extends React.PureComponent<TsAlarmHistoryItemProps> {
  renderText(text: string) {
    return (
      <Highlighter
        highlightClassName="highlight-search-match"
        textToHighlight={text}
        searchWords={[this.props.search]}
      />
    );
  }

  renderRight(): React.ReactNode {
    return (<div className={`${icls}__actions`}>
      <div className={`${icls}__header`}>
      </div>
      <div className={`${icls}__body`}>
        {dateTime(this.props.item.time)
          .format(defaultDateFormat.join(' '))
        }
      </div>
    </div>);
  }

  render(): JSX.Element {
    const { model, alertName, timeStr } = this.props.item;
    const { stateClass, iconClass, text } = model;

    return <li className={icls}>
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
                  searchWords={[this.props.search]}
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

      {this.renderRight()}
    </li>;
  }
}

export default TsAlarmHistoryItem;
