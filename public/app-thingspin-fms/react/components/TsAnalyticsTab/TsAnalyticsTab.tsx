// Js 3rd party libs
import React from 'react';

// Grafana libs
import { EditorTabBody } from 'app/features/dashboard/panel_editor/EditorTabBody';
import { getAngularLoader, AngularComponent } from '@grafana/runtime';

export interface TsAnalyticsTabProps {
  panel: any;
  angularPanel: any;
}

const template = '<ts-analytics-tab />';

export class TsAnalyticsTab extends React.PureComponent<TsAnalyticsTabProps> {
  elem: any;
  component: AngularComponent;
  panelCtrl: any;

  shouldLoadNgTab() {
    return this.props.angularPanel && this.elem && !this.component;
  }

  componentDidMount() {
    if (this.shouldLoadNgTab()) {
      this.loadNgTab(template);
    }
  }

  componentDidUpdate(prevProps: TsAnalyticsTabProps) {
    if (this.shouldLoadNgTab()) {
      this.loadNgTab(template);
    }
  }

  async loadNgTab(template: string) {
    const { angularPanel } = this.props;

    const scope = angularPanel.getScope();

    // When full page reloading in edit mode the angular panel has on fully compiled & instantiated yet
    if (!scope.$$childHead) {
      setTimeout(() => {
        this.forceUpdate();
      });
      return;
    }

    this.panelCtrl = scope.$$childHead.ctrl;
    const loader = getAngularLoader();

    const scopeProps = { ctrl: this.panelCtrl };

    this.component = loader.load(this.elem, scopeProps, template);
  }

  render() {
    return <EditorTabBody heading="Analytics" toolbarItems={[]}>
      <div className="gf-form" ref={(elem) => this.elem = elem}></div>
    </EditorTabBody >;
  }
}
