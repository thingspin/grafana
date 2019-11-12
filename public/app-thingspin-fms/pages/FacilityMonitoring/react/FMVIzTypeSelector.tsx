//
import React, { PureComponent, ReactNode } from 'react';

import config from 'app/core/config';

import { PanelPluginMeta } from '@grafana/data';
import { Select, FormLabel } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

export interface Props {
    onChange: (item: SelectableValue<string>) => void;
}

export interface States {
    current: SelectableValue<string>;
}

export class FMVizTypeSelector extends PureComponent<Props, States> {
    state = {
        current: {
            label: 'Graph',
            value: 'graph',
            imgUrl: "public/app/plugins/panel/graph/img/icn-graph-panel.svg",
        },
    };
    pluginList = this.getPanelPlugins;

    get getPanelPlugins(): PanelPluginMeta[] {
        const allPanels = config.panels;

        return Object.keys(allPanels)
            .filter(key => allPanels[key]['hideFromList'] === false)
            .map(key => allPanels[key])
            .sort((a: PanelPluginMeta, b: PanelPluginMeta) => a.sort - b.sort);
    }

    onChange(item: SelectableValue<string>) {
        this.props.onChange(item);
        this.setState({
            current: {
                ...item
            }
        });
    }

    render(): ReactNode {
        const { pluginList, } = this;
        const { current } = this.state;

        const options = pluginList.map(plugin => ({
            value: plugin.id,
            label: plugin.name,
            imgUrl: plugin.info.logos.small,
            meta: plugin,
        }));

        return (<div className="form-field">
            <FormLabel className="query-keyword" width={5}> 플러그인 </FormLabel>
            <Select className="fm-pp-picker"
                isMulti={false} isClearable={false} backspaceRemovesValue={false}
                maxMenuHeight={500}
                placeholder="플러그인을 선택하세요."
                noOptionsMessage={() => '플러그인을 찾을 수 없습니다.'}
                options={options} value={current}
                onChange={this.onChange.bind(this)}
            />
        </div>);
    }
}
