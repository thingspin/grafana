import React from 'react';

import { QueriesTab } from 'app/features/dashboard/panel_editor/QueriesTab';

export default class FMQueriesTab extends QueriesTab {
    // Override
    renderToolbar = () => {
        const { isAddingMixed } = this.state;

        return (<>
            <div className="flex-grow-1" />
            {!isAddingMixed && (
                <button className="btn navbar-button" onClick={this.onAddQueryClick}>
                    Add Query
                </button>
            )}
            {isAddingMixed && this.renderMixedPicker()}
        </>);
    }
}
