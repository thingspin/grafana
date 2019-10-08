// 3rd part libs
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// @ts-ignore
import Highlighter from 'react-highlight-words';

// Grafana libs
// Models
import { getBackendSrv } from '@grafana/runtime';
import { Props } from 'app/features/alerting/AlertRuleItem';

// Thingspin libs
// Models
import { baseClass as bcls, itemClass as icls, } from '../types';
// Views
import TsAlarmStatsItem from './TsAlarmStatsItem';

enum AlarmRuleStateAPI {
  Count = '/thingspin/annotations/count/newState',
}

export interface TsAlarmRuleItemProps extends Props { }

export interface TsAlrmRuleItemStates {
  stats: {
    alert: number;
    warn: number;
  };
}

// full customize AlertRuleItem React Component
export default class TsAlarmRuleItem extends PureComponent<TsAlarmRuleItemProps, TsAlrmRuleItemStates> {
  ruleUrl: string;

  state = {
    stats: {
      alert: 0,
      warn: 0,
    }
  };

  componentDidMount(): void {
    const { dashboardId, panelId } = this.props.rule;

    Promise.all([
      getBackendSrv().get(AlarmRuleStateAPI.Count, { dashboardId, panelId, newState: 'alerting', }),
      getBackendSrv().get(AlarmRuleStateAPI.Count, { dashboardId, panelId, newState: 'pending', }),
    ]).then(([alert, warn]) => {
      this.setState({ stats: { alert, warn } });
    });
  }

  renderText = (text: string) => (
    <Highlighter
      highlightClassName="highlight-search-match"
      textToHighlight={text}
      searchWords={[this.props.search]}
    />
  );

  render() {
    const { rule, onTogglePause } = this.props;
    const { stateClass, stateText, stateIcon, stateAge, name, info, } = rule;
    const { stats: { warn, alert } } = this.state;

    this.ruleUrl = rule.url.replace('/d/', '/thingspin/alarm/edit/');

    const convStateClass = stateClass.replace('alert', 'alarm');
    const iconClassName = classNames({
      fa: true,
      'fa-play': rule.state === 'paused',
      'fa-pause': rule.state !== 'paused',
    });

    return (
      <li className={`${icls}`}>
        <div className={`${icls}__info`}>
          <span className={`${icls}__icon ${convStateClass}`}>
            <i className={stateIcon} />
          </span>

          <div className={`${icls}__body`}>
            <div className={`${icls}__header`}>

              <div className={`${icls}__name`}>
                <a href={this.ruleUrl}>{this.renderText(name)}</a>
              </div>

              <div className={`${icls}__text`}>
                <span className={`${icls}__status ${stateClass}`}>{this.renderText(stateText)}</span>
                <span className={`${icls}__time`}>
                  <span className={`${icls}__time_for`}>for</span>
                  {stateAge}
                </span>
                <span className={`${icls}__time_value`}>
                  {info && this.renderText(info)}
                </span>
              </div>

            </div>
          </div>
        </div>
        <TsAlarmStatsItem className="ts-color-yellow" icon="fa fa-exclamation-triangle" unit="건">{warn}</TsAlarmStatsItem>
        <TsAlarmStatsItem className="ts-color-red" icon="fa fa-info-circle" unit="건">{alert}</TsAlarmStatsItem>

        <div className={`${icls}__actions`}>
          <button className={`${bcls}-btn`}
            title="Pausing an alarm rule prevents it from executing"
            onClick={onTogglePause}
          >
            <i className={iconClassName} />
          </button>
          <a className={`${bcls}-btn`} href={this.ruleUrl} title="Edit alert rule">
            <i className="gicon gicon-cog" />
          </a>
        </div>
      </li>
    );
  }
}
