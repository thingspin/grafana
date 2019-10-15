// js 3rd party libs
import React from 'react';

// Grafana libs
import { ButtonSelect, ClickOutsideWrapper, withTheme } from '@grafana/ui';
import { UnThemedTimePicker } from '@grafana/ui/src/components/TimePicker/TimePicker';
import { TimePickerPopover } from '@grafana/ui/src/components/TimePicker/TimePickerPopover';
import { TimeOption, TimeRange, DateTime, dateMath, isDateTime, TIME_FORMAT } from '@grafana/data';

// ThingSPIN libs
import { rangeUtil } from '@thingspin/data';

function isTimeOptionEqualToTimeRange({ from, to }: TimeOption, { raw }: TimeRange): boolean {
  return raw.from === from && raw.to === to;
}

const TimePickerTooltipContent = ({ timeRange: { from, to } }: { timeRange: TimeRange }) => (
  <>
    {from.format(TIME_FORMAT)}
    <div className="text-center">to</div>
    {to.format(TIME_FORMAT)}
  </>
);

export class TsTimePicker extends UnThemedTimePicker {
  // Overrride
  mapTimeOptionsToSelectableValues = (selectOpts: TimeOption[] = []) => ([
    {
      label: '사용자 정의 시간 설정',
      value: { from: 'custom', to: 'custom', display: '사용자 정의', section: 1 },
    },
    ...selectOpts.map(value => ({ label: value.display, value, })),
  ]);

  // Override
  render() {
    const { selectOptions, value, onMoveBackward, onMoveForward, timeZone } = this.props;
    const { isCustomOpen } = this.state;
    const options = this.mapTimeOptionsToSelectableValues(selectOptions);
    const currentOption = options.find(item => isTimeOptionEqualToTimeRange(item.value, value));

    const isUTC = timeZone === 'utc';

    const adjustedTime = (time: DateTime) => (isUTC ? time.utc() : time.local()) || null;
    const adjustedTimeRange = {
      from: dateMath.isMathString(value.raw.from) ? value.raw.from : adjustedTime(value.from),
      to: dateMath.isMathString(value.raw.to) ? value.raw.to : adjustedTime(value.to),
    };

    const label = (<>
      {isCustomOpen
        ? <span>사용자 정의 시간 설정</span>
        : <span>{rangeUtil.describeTimeRange(adjustedTimeRange)}</span>
      }
      {isUTC && <span className="time-picker-utc">UTC</span>}
    </>);
    const isAbsolute = isDateTime(value.raw.to);

    return (
      <div className="time-picker" ref={this.pickerTriggerRef}>
        <div className="time-picker-buttons">

          {isAbsolute && (
            <button className="btn navbar-button navbar-button--tight" onClick={onMoveBackward}>
              <i className="fa fa-chevron-left" />
            </button>
          )}

          <ButtonSelect
            className="time-picker-button-select"
            value={currentOption}
            label={label}
            options={options}
            maxMenuHeight={600}
            onChange={this.onSelectChanged}
            iconClass={'fa fa-clock-o fa-fw'}
            tooltipContent={<TimePickerTooltipContent timeRange={value} />}
          />

          {isAbsolute && (
            <button className="btn navbar-button navbar-button--tight" onClick={onMoveForward}>
              <i className="fa fa-chevron-right" />
            </button>
          )}

          {isCustomOpen && (
            <ClickOutsideWrapper onClick={this.onCloseCustom}>
              <TimePickerPopover value={value} timeZone={timeZone} onChange={this.onCustomChange} />
            </ClickOutsideWrapper>
          )}
        </div>
      </div>
    );
  }
}

export default withTheme(TsTimePicker);
