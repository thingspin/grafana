// 3rd party libs
import angular from 'angular';
import React, { PureComponent } from 'react';

// Grafana libs
// Model
import { PanelModel } from 'app/features/dashboard/state/PanelModel';

// ThingSPIN libs
// Models
import { FMDashboardModel } from 'app-thingspin-fms/pages/FacilityMonitoring/models';
// Views
import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';

export interface Props {
  panel: PanelModel;
  dashboard: FMDashboardModel;

  onUpdatePanel: (params: any) => void;
}

export interface Tag {
  value: any;
  label: any;
  [v: string]: any;
}

export interface TagTree {
  siteData: {
    value: any;
    label: any;
    [v: string]: any;
  };
  Taginfo: Tag[];
}

export class AlarmFacilityTree extends PureComponent<Props> {
  // bind global Angularjs Injector
  private $injector = angular.element(document).injector();

  onClickFacilityTree = (params: TagTree) => {
    const { onUpdatePanel } = this.props;

    if (onUpdatePanel) {
      this.props.onUpdatePanel(params);
    }
  };

  render(): JSX.Element {
    const { dashboard: { facilityTags, site } } = this.props;

    return <div className="fm-left-tree">
      <FacilityTree
        siteinfo={site}
        taginfo={facilityTags}
        inject={this.$injector}
        click={this.onClickFacilityTree}
      />
    </div>;
  }
}

export default AlarmFacilityTree;
