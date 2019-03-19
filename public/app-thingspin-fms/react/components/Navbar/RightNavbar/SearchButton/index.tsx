// External Libraries
import React, { PureComponent } from 'react';
// Grafana Libraries
import { updateLocation } from 'app/core/actions';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
// ThingSPIN Libraries
import { TsBaseProps } from 'app-thingspin-fms/models/common';

export interface Props extends TsBaseProps {
  updateLocation: typeof updateLocation;
}

export interface States {
  search: string;
}

export class TsNavSearchComponent extends PureComponent<Props, States> {
  constructor(props) {
    super(props);

    this.state = {
      search: '',
    };
  }

  // common event Methods

  onInputKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        this.startSearch(this.state.search);
        break;
    }
  }

  onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value }: HTMLInputElement = e.target;
    this.setState({ search: value });
  }

  onClickIcon() {
    this.startSearch(this.state.search);
  }

  startSearch(search) {
    const { updateLocation } = this.props;

    if (search) {
      updateLocation({
        path: '/fms/search',
        query: {
          search,
        },
      });
    }
  }

  render() {
    // Virtual DOM Private Variables
    // Virtual DOM events Methods

    // return virtual DOM
    return (
      <div className="ts-nav-search-component">
        <div className="ts-nav-search-input-form">
          <input
            type="text"
            placeholder={'검색'}
            onKeyPress={this.onInputKeyPress.bind(this)}
            onChange={this.onInputChange.bind(this)}
          />
          <button onClick={this.onClickIcon.bind(this)}>
            <i className="fa fa-search" />
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsNavSearchComponent, mapStateToProps, mapDispatchToProps);
