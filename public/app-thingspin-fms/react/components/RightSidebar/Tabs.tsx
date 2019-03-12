import * as React from 'react';

interface TabsComponent {
  activeName?: string;
  handleTabClick?: (name: string, content: React.ReactNode) => void;
}
const TabsContext = React.createContext<TabsComponent>({});

interface State {
  activeName: string;
  activeContent: React.ReactNode;
}
interface TabProps {
  name: string;
  initialActive?: boolean;
  heading: () => string | JSX.Element;
}
class Tabs extends React.Component<{}, State> {
  static Tab: React.SFC<TabProps> = props => (
    <TabsContext.Consumer>
      {(context: TabsComponent) => {
        if (!context.activeName && props.initialActive) {
          if (context.handleTabClick) {
            context.handleTabClick(props.name, props.children);
            return null;
          }
        }
        const activeName = context.activeName ? context.activeName : props.initialActive ? props.name : '';
        const handleTabClick = (e: React.MouseEvent<HTMLLIElement>) => {
          if (context.handleTabClick) {
            context.handleTabClick(props.name, props.children);
          }
        };
        return (
          <li onClick={handleTabClick} className={props.name === activeName ? 'fms-right-tap-selected' : ''}>
            {props.heading()}
          </li>
        );
      }}
    </TabsContext.Consumer>
  );
  render() {
    return (
      <TabsContext.Provider
        value={{
          activeName: this.state ? this.state.activeName : '',
          handleTabClick: this.handleTabClick,
        }}
      >
        <ul className="tabs fms-right-tapitem">{this.props.children}</ul>
        <div>{this.state && this.state.activeContent}</div>
      </TabsContext.Provider>
    );
  }

  private handleTabClick = (name: string, content: React.ReactNode) => {
    this.setState({ activeName: name, activeContent: content });
  };
}

export default Tabs;
