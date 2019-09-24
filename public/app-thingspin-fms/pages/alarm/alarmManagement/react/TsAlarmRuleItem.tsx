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

  renderText(text: string) {
    return (
      <Highlighter
        highlightClassName="highlight-search-match"
        textToHighlight={text}
        searchWords={[this.props.search]}
      />
    );
  }

  componentDidMount(): void {
    const { dashboardId, panelId } = this.props.rule;
    const url = '/thingspin/annotations/count/newState';

    Promise.all([
      getBackendSrv().get(url, { dashboardId, panelId, newState: 'no_data', }),
      getBackendSrv().get(url, { dashboardId, panelId, newState: 'pending', }),
    ]).then(([alert, warn]) => {
      this.setState({ stats: { alert, warn } });
    });
  }

  renderInfo(): React.ReactNode {
    const {
      stateClass, stateText, stateIcon, stateAge,
      name, info,
    } = this.props.rule;
    const convStateClass = stateClass.replace('alert', 'alarm');

    return (<div className={`${icls}__info`}>
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
    </div>);
  }

  renderStat(): React.ReactNode {
    const { stats: { warn, alert } } = this.state;
    return (<>
      <TsAlarmStatsItem icon="fa fa-exclamation-triangle">경고 {warn} 회 발생</TsAlarmStatsItem>
      <TsAlarmStatsItem icon="fa fa-info-circle">위험 {alert} 회 발생</TsAlarmStatsItem>
    </>);
  }

  renderAction(): React.ReactNode {
    const { rule, onTogglePause } = this.props;

    const iconClassName = classNames({
      fa: true,
      'fa-play': rule.state === 'paused',
      'fa-pause': rule.state !== 'paused',
    });

    return (<div className={`${icls}__actions`}>
      <button className={`${bcls}-btn`}
        title="Pausing an alarm rule prevents it from executing"
        onClick={onTogglePause}
      >
        <i className={iconClassName} />
      </button>
      <a className={`${bcls}-btn`} href={this.ruleUrl} title="Edit alert rule">
        <i className="gicon gicon-cog" />
      </a>
    </div>);
  }

  render() {
    const { rule } = this.props;
    this.ruleUrl = rule.url.replace('/d/', '/thingspin/alarm/edit/');

    return (
      <li className={`${icls}`}>
        {this.renderInfo()}

        {this.renderStat()}

        {this.renderAction()}
      </li>
    );
  }
}
