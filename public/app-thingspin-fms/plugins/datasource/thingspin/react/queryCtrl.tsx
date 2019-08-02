// 3rd party libs
import React, { Component, ReactNode } from 'react';
import classNames from 'classnames';

// grafana core libs
import { coreModule } from "app/core/core";
import { PanelOptionsGroup, FormLabel, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

// thingspin core libs
import CheckboxTree from 'app-thingspin-fms/react/components/react-checkbox-tree';

// thingspin plugin libs
import { TsSite, RcQueryCtrlProps, RcQueryCtrlStates, ReactDirective, TsTree } from '../models';
import { getSites, getTree } from '../utils/backendCtrl';

// load scss
import './_queryCtrl.scss';

export class QueryCtrl extends Component<RcQueryCtrlProps, RcQueryCtrlStates> {
    // default init
    state: RcQueryCtrlStates = {
        // Site selector Datas
        sites: [],

        // CheckBoxTree Component Datas
        expanded: [],
        treeData: [],
    };

    async updateTreeData(siteId: number): Promise<void> {
        if (siteId) {
            const treeData: TsTree[] = await getTree(siteId);

            this.setState({
                treeData: treeData ? this.generateIcon(treeData) : [],
            });
        }
    }

    generateIcon(treeData: TsTree[]) {
        if (Array.isArray(treeData)) {
            for (const data of treeData) {
                data.icon = data.tag_id
                    ? <span className="icon-tag"><i className="tsi icon-ts-tag" /></span>
                    : <span className="icon-facility"><i className="fa fa-steam fa-1x" /></span>;
                data.children = this.generateIcon(data.children);
            }
        }
        return treeData;
    }

    async updateSites(): Promise<void> {
        const sites: TsSite[] = await getSites();

        this.setState({
            sites: sites ? sites : [],
        });
    }

    onExpand(expanded: any[]): void {
        this.setState({ expanded });
    }

    onCheck(checked: any[], _checkNode: object, tagNodes: any[]): void {
        this.props.onChange({ checked, tagNodes});
    }

    onSiteChange(item: SelectableValue<any>): void {
        this.props.onChange({
            siteId: item.value,
            checked: [],
            tagNodes: [],
        });
    }

    // react lifecycle
    async componentWillMount(): Promise<void> {
        const { siteId } = this.props.target;

        await this.updateSites();
        if (siteId) {
            await this.updateTreeData(siteId);
        }
    }

    // react lifecycle
    componentWillReceiveProps(nextProps: RcQueryCtrlProps): void {
        this.updateTreeData(nextProps.target.siteId);
    }

    // react lifecycle
    render(): ReactNode {
        const {
            state: { expanded, treeData, sites, },
            props: {
                target: { siteId, checked },
            },
            onCheck, onExpand, onSiteChange,
        } = this;

        const selectOpts = sites.map((site: TsSite): SelectableValue<any> => ({ label: site.name, value: site.id, }));
        const value = selectOpts.find((item: SelectableValue<any>): boolean => (item.value === siteId));
        const siteLabel = value && value.label ? value.label : 'Unknown';
        const gridClass = classNames('fms-form-grid', { 'fms-grid1': !siteId, 'fms-grid2': !!siteId, });

        return <div className={gridClass}>
            <PanelOptionsGroup title="사이트 선택">
                <div className="gf-form-inline">
                    <FormLabel className="query-keyword" width={7}> 사이트 </FormLabel>
                    <Select
                        // Datas
                        options={selectOpts} value={value}
                        // Events
                        onChange={onSiteChange.bind(this)} />
                </div>
            </PanelOptionsGroup>

            {siteId ?
                <PanelOptionsGroup title={`${siteLabel} 태그 선택`}>
                    <CheckboxTree
                        // Data
                        nodes={treeData} checked={checked ? checked : []} expanded={expanded}
                        // Event
                        onCheck={onCheck.bind(this)} onExpand={onExpand.bind(this)}
                    ></CheckboxTree>
                </PanelOptionsGroup>
                : null
            }
        </div>;
    }
}

// conversion react component -> angularJs directive
coreModule.directive('rcTsDs', [
    'reactDirective', (reactDirective: ReactDirective): any => (reactDirective(QueryCtrl, [
        'target',
        ['onChange', { watchDepth: 'reference', wrapApply: true }],
    ]) ),
]);
