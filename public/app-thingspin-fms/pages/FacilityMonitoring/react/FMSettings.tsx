import React from 'react';

import { DashboardSettings } from 'app/features/dashboard/components/DashboardSettings';
import { getAngularLoader } from '@grafana/runtime';

// (Customized grafana react component: iiHOC)
export default class extends DashboardSettings {

    componentDidMount(): void {
        const loader = getAngularLoader();

        const template = '<fm-dashboard-settings dashboard="dashboard" class="dashboard-settings" />';
        const scopeProps = { dashboard: this.props.dashboard };

        this.angularCmp = loader.load(this.element, scopeProps, template);
    }

    // override
    render(): JSX.Element {
        return <div className="panel-height-helper" ref={element => (this.element = element)} />;
    }
}
