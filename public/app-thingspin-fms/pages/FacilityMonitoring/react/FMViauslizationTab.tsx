// External Libraries
import React from 'react';

// Utils & Serivces
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { StoreState } from 'app/types';
import { updateLocation } from 'app/core/actions';

// Grafana Components
import { VisualizationTab } from 'app/features/dashboard/panel_editor/VisualizationTab';
import { EditorToolbarView, EditorTabBody } from 'app/features/dashboard/panel_editor/EditorTabBody';

// (Customized grafana react component: iiHOC)
export class FMVisualizationTab extends VisualizationTab {

  // Override
  renderToolbar = (): JSX.Element => {
    return <></>;
  };

  // Override
  render() {
    const { scrollTop } = this.state;

    const pluginHelp: EditorToolbarView = {
      heading: 'Help',
      icon: 'fa fa-question',
      render: this.renderHelp,
    };

    return (
      <EditorTabBody
        heading="Visualization"
        renderToolbar={this.renderToolbar}
        toolbarItems={[pluginHelp]}
        scrollTop={scrollTop}
        setScrollTop={this.setScrollTop}
      >
        <>
          {this.renderPanelOptions()}
        </>
      </EditorTabBody>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  urlOpenVizPicker: !!state.location.query.openVizPicker,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(FMVisualizationTab, mapStateToProps, mapDispatchToProps);
