// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana libs
import { StoreState } from 'app/types';

import { FilterInput } from 'app/core/components/FilterInput/FilterInput';
import { getNavModel } from 'app/core/selectors/navModel';

import { getAlertRuleItems, getSearchQuery } from 'app/features/alerting/state/selectors';
import AlertRuleItem from 'app/features/alerting/AlertRuleItem';

import { AlertRuleList } from "app/features/alerting/AlertRuleList";

import { getAlertRulesAsync, setSearchQuery, togglePauseAlertRule } from 'app/features/alerting/state/actions';
import { updateLocation } from 'app/core/actions';

// iiHOC(extended AlertRuleList)
export class TsAlarmRuleList extends AlertRuleList {

  // override(Render Hijacking)
  render() {
    const { alertRules, search } = this.props;

    return (<>
      <div className="page-action-bar">

        <div className="gf-form gf-form--grow">
          <FilterInput
            labelClassName="gf-form--has-input-icon gf-form--grow"
            inputClassName="gf-form-input"
            placeholder="Search alerts"
            value={search}
            onChange={this.onSearchQueryChange}
          />
        </div>

        <div className="gf-form">
          <label className="gf-form-label">States</label>

          <div className="gf-form-select-wrapper width-13">
            <select className="gf-form-input" onChange={this.onStateFilterChanged} value={this.getStateFilter()}>
              {this.stateFilters.map(this.alertStateFilterOption)}
            </select>
          </div>
        </div>

        <div className="page-action-bar__spacer" />

        <a className="btn btn-secondary" onClick={this.onOpenHowTo}>
          How to add an alert
        </a>
      </div>

      <section>

        <ol className="alert-rule-list">
          {alertRules.map(rule => (
            <AlertRuleItem
              rule={rule}
              key={rule.id}
              search={search}
              onTogglePause={() => this.onTogglePause(rule)}
            />
          ))}
        </ol>

      </section>
    </>);
  }
}

export const mapStateToProps = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'alert-list'),
  alertRules: getAlertRuleItems(state.alertRules),
  stateFilter: state.location.query.state,
  search: getSearchQuery(state.alertRules),
  isLoading: state.alertRules.isLoading,
});

export const mapDispatchToProps = {
  updateLocation,
  getAlertRulesAsync,
  setSearchQuery,
  togglePauseAlertRule,
};

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TsAlarmRuleList)
);
