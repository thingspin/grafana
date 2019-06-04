import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';

import { ExploreId, ExploreMode } from 'app/types/explore';
import {
  DataSourceSelectItem,
  RawTimeRange,
  ClickOutsideWrapper,
  TimeZone,
  TimeRange,
  SelectOptionItem,
} from '@grafana/ui';
import { DataSourcePicker } from 'app/core/components/Select/DataSourcePicker';
import { StoreState } from 'app/types/store';
import {
  changeDatasource,
  clearQueries,
  splitClose,
  runQueries,
  splitOpen,
  changeRefreshInterval,
  changeMode,
} from './state/actions';
import TimePicker from './TimePicker';
import { getTimeZone } from '../profile/state/selectors';
import { RefreshPicker, SetInterval } from '@grafana/ui';
import ToggleButtonGroup, { ToggleButton } from 'app/core/components/ToggleButtonGroup/ToggleButtonGroup';

enum IconSide {
  left = 'left',
  right = 'right',
}

const createResponsiveButton = (options: {
  splitted: boolean;
  title: string;
  onClick: () => void;
  buttonClassName?: string;
  iconClassName?: string;
  iconSide?: IconSide;
  disabled?: boolean;
}) => {
  const defaultOptions = {
    iconSide: IconSide.left,
  };
  const props = { ...options, defaultOptions };
  const { title, onClick, buttonClassName, iconClassName, splitted, iconSide, disabled } = props;

  return (
    <button
      className={`btn navbar-button ${buttonClassName ? buttonClassName : ''}`}
      onClick={onClick}
      disabled={disabled || false}
    >
      {iconClassName && iconSide === IconSide.left ? <i className={`${iconClassName}`} /> : null}
      <span className="btn-title">{!splitted ? title : ''}</span>
      {iconClassName && iconSide === IconSide.right ? <i className={`${iconClassName}`} /> : null}
    </button>
  );
};

interface OwnProps {
  exploreId: ExploreId;
  timepickerRef: React.RefObject<TimePicker>;
  onChangeTime: (range: RawTimeRange, changedByScanner?: boolean) => void;
}

interface StateProps {
  datasourceMissing: boolean;
  exploreDatasources: DataSourceSelectItem[];
  loading: boolean;
  range: TimeRange;
  timeZone: TimeZone;
  selectedDatasource: DataSourceSelectItem;
  splitted: boolean;
  refreshInterval: string;
  supportedModeOptions: Array<SelectOptionItem<ExploreMode>>;
  selectedModeOption: SelectOptionItem<ExploreMode>;
  hasLiveOption: boolean;
  isLive: boolean;
}

interface DispatchProps {
  changeDatasource: typeof changeDatasource;
  clearAll: typeof clearQueries;
  runQueries: typeof runQueries;
  closeSplit: typeof splitClose;
  split: typeof splitOpen;
  changeRefreshInterval: typeof changeRefreshInterval;
  changeMode: typeof changeMode;
}

type Props = StateProps & DispatchProps & OwnProps;

export class UnConnectedExploreToolbar extends PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  onChangeDatasource = async option => {
    this.props.changeDatasource(this.props.exploreId, option.value);
  };

  onClearAll = () => {
    this.props.clearAll(this.props.exploreId);
  };

  onRunQuery = () => {
    return this.props.runQueries(this.props.exploreId);
  };

  onCloseTimePicker = () => {
    this.props.timepickerRef.current.setState({ isOpen: false });
  };

  onChangeRefreshInterval = (item: string) => {
    const { changeRefreshInterval, exploreId } = this.props;
    changeRefreshInterval(exploreId, item);
  };

  onModeChange = (mode: ExploreMode) => {
    const { changeMode, exploreId } = this.props;
    changeMode(exploreId, mode);
  };

  render() {
    const {
      datasourceMissing,
      exploreDatasources,
      closeSplit,
      exploreId,
      loading,
      range,
      timeZone,
      selectedDatasource,
      splitted,
      timepickerRef,
      refreshInterval,
      onChangeTime,
      split,
      supportedModeOptions,
      selectedModeOption,
      hasLiveOption,
      isLive,
    } = this.props;

    return (
      <div className={splitted ? 'explore-toolbar splitted' : 'explore-toolbar'}>
        <div className="explore-toolbar-item">
          <div className="explore-toolbar-header">
            <div className="explore-toolbar-header-title">
              {exploreId === 'left' && (
                <span className="navbar-page-btn">
                  <i className="gicon gicon-explore" />
                  Explore
                </span>
              )}
            </div>
            {splitted && (
              <a className="explore-toolbar-header-close" onClick={() => closeSplit(exploreId)}>
                <i className="fa fa-times fa-fw" />
              </a>
            )}
          </div>
        </div>
        <div className="explore-toolbar-item">
          <div className="explore-toolbar-content">
            {!datasourceMissing ? (
              <div className="explore-toolbar-content-item">
                <div className="datasource-picker">
                  <DataSourcePicker
                    onChange={this.onChangeDatasource}
                    datasources={exploreDatasources}
                    current={selectedDatasource}
                  />
                </div>
                {supportedModeOptions.length > 1 ? (
                  <div className="query-type-toggle">
                    <ToggleButtonGroup label="" transparent={true}>
                      <ToggleButton
                        key={ExploreMode.Metrics}
                        value={ExploreMode.Metrics}
                        onChange={this.onModeChange}
                        selected={selectedModeOption.value === ExploreMode.Metrics}
                      >
                        {'Metrics'}
                      </ToggleButton>
                      <ToggleButton
                        key={ExploreMode.Logs}
                        value={ExploreMode.Logs}
                        onChange={this.onModeChange}
                        selected={selectedModeOption.value === ExploreMode.Logs}
                      >
                        {'Logs'}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                ) : null}
              </div>
            ) : null}

            {exploreId === 'left' && !splitted ? (
              <div className="explore-toolbar-content-item">
                {createResponsiveButton({
                  splitted,
                  title: 'Split',
                  onClick: split,
                  iconClassName: 'fa fa-fw fa-columns icon-margin-right',
                  iconSide: IconSide.left,
                  disabled: isLive,
                })}
              </div>
            ) : null}
            <div className="explore-toolbar-content-item timepicker">
              {!isLive && (
                <ClickOutsideWrapper onClick={this.onCloseTimePicker}>
                  <TimePicker ref={timepickerRef} range={range} isUtc={timeZone.isUtc} onChangeTime={onChangeTime} />
                </ClickOutsideWrapper>
              )}

              <RefreshPicker
                onIntervalChanged={this.onChangeRefreshInterval}
                onRefresh={this.onRunQuery}
                value={refreshInterval}
                tooltip="Refresh"
                hasLiveOption={hasLiveOption}
              />
              {refreshInterval && <SetInterval func={this.onRunQuery} interval={refreshInterval} loading={loading} />}
            </div>

            <div className="explore-toolbar-content-item">
              <button className="btn navbar-button" onClick={this.onClearAll}>
                Clear All
              </button>
            </div>
            <div className="explore-toolbar-content-item">
              {createResponsiveButton({
                splitted,
                title: 'Run Query',
                onClick: this.onRunQuery,
                buttonClassName: 'navbar-button--secondary',
                iconClassName:
                  loading && !isLive ? 'fa fa-spinner fa-fw fa-spin run-icon' : 'fa fa-level-down fa-fw run-icon',
                iconSide: IconSide.right,
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState, { exploreId }: OwnProps): StateProps => {
  const splitted = state.explore.split;
  const exploreItem = state.explore[exploreId];
  const {
    datasourceInstance,
    datasourceMissing,
    exploreDatasources,
    range,
    refreshInterval,
    graphIsLoading,
    logIsLoading,
    tableIsLoading,
    supportedModes,
    mode,
    isLive,
  } = exploreItem;
  const selectedDatasource = datasourceInstance
    ? exploreDatasources.find(datasource => datasource.name === datasourceInstance.name)
    : undefined;
  const loading = graphIsLoading || logIsLoading || tableIsLoading;
  const hasLiveOption = datasourceInstance && datasourceInstance.convertToStreamTargets ? true : false;

  const supportedModeOptions: Array<SelectOptionItem<ExploreMode>> = [];
  let selectedModeOption = null;
  for (const supportedMode of supportedModes) {
    switch (supportedMode) {
      case ExploreMode.Metrics:
        const option1 = {
          value: ExploreMode.Metrics,
          label: ExploreMode.Metrics,
        };
        supportedModeOptions.push(option1);
        if (mode === ExploreMode.Metrics) {
          selectedModeOption = option1;
        }
        break;
      case ExploreMode.Logs:
        const option2 = {
          value: ExploreMode.Logs,
          label: ExploreMode.Logs,
        };
        supportedModeOptions.push(option2);
        if (mode === ExploreMode.Logs) {
          selectedModeOption = option2;
        }
        break;
    }
  }

  return {
    datasourceMissing,
    exploreDatasources,
    loading,
    range,
    timeZone: getTimeZone(state.user),
    selectedDatasource,
    splitted,
    refreshInterval,
    supportedModeOptions,
    selectedModeOption,
    hasLiveOption,
    isLive,
  };
};

const mapDispatchToProps: DispatchProps = {
  changeDatasource,
  changeRefreshInterval,
  clearAll: clearQueries,
  runQueries,
  closeSplit: splitClose,
  split: splitOpen,
  changeMode: changeMode,
};

export const ExploreToolbar = hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(UnConnectedExploreToolbar)
);
