import { getDefaultCondition } from 'app/features/alerting/getAlertingValidationMessage';

// ref(alertDef.ts)

export interface ConditionType {
  text: string;
  value: string;
}

export const tsEvalFunctions: ConditionType[] = [
  { text: '이상', value: 'gt' },
  { text: '이하', value: 'lt' },
  { text: '범위 외', value: 'outside_range' },
  { text: '범위 내', value: 'within_range' },
  { text: '빈 값', value: 'no_value' },
];

export const tsReducerTypes: ConditionType[] = [
  { text: '범위 내 평균 값', value: 'avg' },
  { text: '범위 내 최소 값', value: 'min' },
  { text: '범위 내 최대 값', value: 'max' },
  { text: '범위 내 합', value: 'sum' },
  { text: '범위 내 개수', value: 'count' },
  { text: '범위 내 마지막 값', value: 'last' },
  { text: '범위 내 중간 값', value: 'median' },
  { text: '범위 내 차이 값', value: 'diff' },
  { text: '범위 내 퍼센트 차이 값', value: 'percent_diff' },
  // { text: 'count_non_null', value: 'count_non_null' },
];

export const tsEvalOperators: ConditionType[] = [
  { text: '또는', value: 'or' },
  { text: '그리고', value: 'and' }
];


export const getDefaltCondition = (label = 'A', from = '5s') => {
  const defaultCondition = getDefaultCondition();
  defaultCondition.query.params[0] = label;
  defaultCondition.query.params[1] = from;
  defaultCondition.reducer.type = 'last';

  return defaultCondition;
};
