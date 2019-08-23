import { DashboardSettings } from 'app/features/dashboard/components/DashboardSettings';
import { getAngularLoader } from '@grafana/runtime';

// (Customized grafana react component: iiHOC)
export default class extends DashboardSettings {

    // Override
    componentDidMount(): void {
        const loader = getAngularLoader();

        const template = '<alarm-dashboard-settings dashboard="dashboard" class="dashboard-settings" />';
        const scopeProps = { dashboard: this.props.dashboard };

        this.angularCmp = loader.load(this.element, scopeProps, template);
    }

}
