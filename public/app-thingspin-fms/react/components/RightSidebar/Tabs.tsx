import React, { createContext, PureComponent, SFC, MouseEvent, ReactNode } from 'react';

interface TabsComponent {
  activeName?: string;
  handleTabClick?: (name: string, content: ReactNode) => void;
}
const TabsContext = createContext<TabsComponent>({});
const { Provider, Consumer } = TabsContext;

interface State {
  activeName: string;
  activeContent: ReactNode;
}
interface TabProps {
  name: string;
  initialActive?: boolean;
  heading: () => string | JSX.Element;
}
class Tabs extends PureComponent<{}, State> {
  static Tab: SFC<TabProps> = props => (
    <Consumer>
      {(context: TabsComponent) => {
        if (!context.activeName && props.initialActive) {
          if (context.handleTabClick) {
            context.handleTabClick(props.name, props.children);
            return null;
          }
        }
        const activeName = context.activeName ? context.activeName : props.initialActive ? props.name : '';
        const handleTabClick = (e: MouseEvent<HTMLLIElement>) => {
          if (context.handleTabClick) {
            context.handleTabClick(props.name, props.children);
          }
        };
        return (
          <li onClick={handleTabClick} className={props.name === activeName ? 'fms-right-tap-selected' : ''}>
            <ul>{props.heading()}</ul>
          </li>
        );
      }}
    </Consumer>
  );

  render() {
    return (
      <Provider
        value={{
          activeName: this.state ? this.state.activeName : '',
          handleTabClick: this.handleTabClick,
        }}
      >
        <ul className="tabs fms-right-tapitem">{this.props.children}</ul>
        <div>{this.state && this.state.activeContent}</div>
      </Provider>
    );
  }

  private handleTabClick = (name: string, content: ReactNode) => {
    //sooskim tempo out - this.setState({ activeName: name, activeContent: content });
  };
}

export default Tabs;
