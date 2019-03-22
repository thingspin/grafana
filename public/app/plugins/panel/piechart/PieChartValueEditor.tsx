import React, { PureComponent } from 'react';
import { FormLabel, PanelOptionsGroup, Select, UnitPicker } from '@grafana/ui';
import { PieChartValueOptions } from './types';

const statOptions = [
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'avg', label: 'Average' },
  { value: 'current', label: 'Current' },
  { value: 'total', label: 'Total' },
];

const labelWidth = 6;

export interface Props {
  options: PieChartValueOptions;
  onChange: (valueOptions: PieChartValueOptions) => void;
}

export default class PieChartValueEditor extends PureComponent<Props> {
  onUnitChange = unit =>
    this.props.onChange({
      ...this.props.options,
      unit: unit.value,
    });

  onStatChange = stat =>
    this.props.onChange({
      ...this.props.options,
      stat: stat.value,
    });

  render() {
    const { stat, unit } = this.props.options;

    return (
      <PanelOptionsGroup title="Value">
        <div className="gf-form">
          <FormLabel width={labelWidth}>Unit</FormLabel>
          <UnitPicker defaultValue={unit} onChange={this.onUnitChange} />
        </div>
        <div className="gf-form">
          <FormLabel width={labelWidth}>Value</FormLabel>
          <Select
            width={12}
            options={statOptions}
            onChange={this.onStatChange}
            value={statOptions.find(option => option.value === stat)}
          />
        </div>
      </PanelOptionsGroup>
    );
  }
}
