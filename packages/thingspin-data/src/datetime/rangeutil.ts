import each from 'lodash/each';
import groupBy from 'lodash/groupBy';

import { RawTimeRange } from '@grafana/data/types/time';

import * as dateMath from '@grafana/data/src/datetime/datemath';
import { isDateTime, DateTime } from '@grafana/data/src/datetime/moment_wrapper';

const spans: { [key: string]: { display: string; section?: number } } = {
  s: { display: 'second' },
  m: { display: 'minute' },
  h: { display: 'hour' },
  d: { display: 'day' },
  w: { display: 'week' },
  M: { display: 'month' },
  y: { display: 'year' },
};

const rangeOptions = [
  { from: 'now/d', to: 'now/d', display: '오늘', section: 2 },
  { from: 'now/d', to: 'now', display: '오늘까지', section: 2 },
  { from: 'now/w', to: 'now/w', display: '이번 주', section: 2 },
  { from: 'now/w', to: 'now', display: '이번 주까지', section: 2 },
  { from: 'now/M', to: 'now/M', display: '이번 달', section: 2 },
  { from: 'now/M', to: 'now', display: '이번 달까지', section: 2 },
  { from: 'now/y', to: 'now/y', display: '올해', section: 2 },
  { from: 'now/y', to: 'now', display: '올해까지', section: 2 },

  { from: 'now-1d/d', to: 'now-1d/d', display: '어제 하루', section: 1 },
  {
    from: 'now-2d/d',
    to: 'now-2d/d',
    display: '그저꼐 하루',
    section: 1,
  },
  {
    from: 'now-7d/d',
    to: 'now-7d/d',
    display: '1주일 전 해당 요일',
    section: 1,
  },
  { from: 'now-1w/w', to: 'now-1w/w', display: '전주', section: 1 },
  { from: 'now-1M/M', to: 'now-1M/M', display: '전달', section: 1 },
  { from: 'now-1y/y', to: 'now-1y/y', display: '저번해', section: 1 },

  { from: 'now-1m', to: 'now', display: '1분 전까지', section: 3 },
  { from: 'now-3m', to: 'now', display: '3분 전까지', section: 3 },
  { from: 'now-5m', to: 'now', display: '5분 전까지', section: 3 },
  { from: 'now-15m', to: 'now', display: '15분 전까지', section: 3 },
  { from: 'now-30m', to: 'now', display: '30분 전까지', section: 3 },
  { from: 'now-1h', to: 'now', display: '1시간 전까지', section: 3 },
  { from: 'now-3h', to: 'now', display: '3시간 전까지', section: 3 },
  { from: 'now-6h', to: 'now', display: '6시간 전까지', section: 3 },
  { from: 'now-12h', to: 'now', display: '12시간 전까지', section: 3 },
  { from: 'now-24h', to: 'now', display: '1일 전까지', section: 3 },
  { from: 'now-2d', to: 'now', display: '2일 전까지', section: 0 },
  { from: 'now-7d', to: 'now', display: '7일 전까지', section: 0 },
  { from: 'now-30d', to: 'now', display: '30일 전까지', section: 0 },
  { from: 'now-90d', to: 'now', display: '90일 전까지', section: 0 },
  { from: 'now-6M', to: 'now', display: '6개월 전까지', section: 0 },
  { from: 'now-1y', to: 'now', display: '1년 전까지', section: 0 },
  { from: 'now-2y', to: 'now', display: '2년 전까지', section: 0 },
  { from: 'now-5y', to: 'now', display: '5년 전까지', section: 0 },
];

const absoluteFormat = 'YYYY-MM-DD HH:mm:ss';

const rangeIndex: any = {};
each(rangeOptions, (frame: any) => {
  rangeIndex[frame.from + ' to ' + frame.to] = frame;
});

export function getRelativeTimesList(timepickerSettings: any, currentDisplay: any) {
  const groups = groupBy(rangeOptions, (option: any) => {
    option.active = option.display === currentDisplay;
    return option.section;
  });

  // _.each(timepickerSettings.time_options, (duration: string) => {
  //   let info = describeTextRange(duration);
  //   if (info.section) {
  //     groups[info.section].push(info);
  //   }
  // });

  return groups;
}

function formatDate(date: DateTime) {
  return date.format(absoluteFormat);
}

// handles expressions like
// 5m
// 5m to now/d
// now/d to now
// now/d
// if no to <expr> then to now is assumed
export function describeTextRange(expr: any) {
  const isLast = expr.indexOf('+') !== 0;
  if (expr.indexOf('now') === -1) {
    expr = (isLast ? 'now-' : 'now') + expr;
  }

  let opt = rangeIndex[expr + ' to now'];
  if (opt) {
    return opt;
  }

  if (isLast) {
    opt = { from: expr, to: 'now' };
  } else {
    opt = { from: 'now', to: expr };
  }

  const parts = /^now([-+])(\d+)(\w)/.exec(expr);
  if (parts) {
    const unit = parts[3];
    const amount = parseInt(parts[2], 10);
    const span = spans[unit];
    if (span) {
      opt.display = isLast ? 'Last ' : 'Next ';
      opt.display += amount + ' ' + span.display;
      opt.section = span.section;
      if (amount > 1) {
        opt.display += 's';
      }
    }
  } else {
    opt.display = opt.from + ' to ' + opt.to;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range: RawTimeRange): string {
  const option = rangeIndex[range.from.toString() + ' to ' + range.to.toString()];
  if (option) {
    return option.display;
  }

  if (isDateTime(range.from) && isDateTime(range.to)) {
    return formatDate(range.from) + ' to ' + formatDate(range.to);
  }

  if (isDateTime(range.from)) {
    const toMoment = dateMath.parse(range.to, true);
    return toMoment ? formatDate(range.from) + ' to ' + toMoment.fromNow() : '';
  }

  if (isDateTime(range.to)) {
    const from = dateMath.parse(range.from, false);
    return from ? from.fromNow() + ' to ' + formatDate(range.to) : '';
  }

  if (range.to.toString() === 'now') {
    const res = describeTextRange(range.from);
    return res.display;
  }

  return range.from.toString() + ' to ' + range.to.toString();
}

export const isValidTimeSpan = (value: string) => {
  if (value.indexOf('$') === 0 || value.indexOf('+$') === 0) {
    return true;
  }

  const info = describeTextRange(value);
  return info.invalid !== true;
};
