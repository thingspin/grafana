import React, { PureComponent, ReactNode } from 'react';
import { Provider, TabsComponent } from './Context';

export interface State {
  name: string;
  content: ReactNode;
}

export default class Tabs extends PureComponent<{}, State> {
  renderEmpty(ProviderValue: TabsComponent, children: ReactNode): ReactNode {

    return (<Provider value={ProviderValue}>
      <ul className="fms-tab-header">
        {children}
      </ul>
      <div></div>
    </Provider>
    );
  }

  render(): ReactNode {
    const { children } = this.props;
    const ProviderValue: TabsComponent = {
      name: this.state ? this.state.name : '',
      handleTabClick: this.handleTabClick.bind(this),
    };

    if (!this.state) {
      return this.renderEmpty(ProviderValue, children);
    }
    const { content } = this.state;

    return (<Provider value={ProviderValue}>
      <ul className="fms-tab-header">
        {children}
      </ul>
      <div>{content}</div>
    </Provider>);
  }

  handleTabClick(name: string, content: ReactNode) {
    this.setState({ name, content });
  }
}
