// Libraries
import classNames from 'classnames';
import React, { PureComponent } from 'react';

// Ignoring because I couldn't get @types/react-select work wih Torkel's fork
// @ts-ignore
import { default as ReactSelect } from '@torkelo/react-select';
// @ts-ignore
import { default as ReactAsyncSelect } from '@torkelo/react-select/lib/Async';
// @ts-ignore
import { components } from '@torkelo/react-select';

// Components
import { SelectOption } from './SelectOption';
import { SingleValue } from './SingleValue';
import SelectOptionGroup from './SelectOptionGroup';
import IndicatorsContainer from './IndicatorsContainer';
import NoOptionsMessage from './NoOptionsMessage';
import resetSelectStyles from './resetSelectStyles';
import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';
import { PopoverContent } from '../Tooltip/Tooltip';
import { Tooltip } from '../Tooltip/Tooltip';
import { SelectableValue } from '@grafana/data';

export interface CommonProps<T> {
  defaultValue?: any;
  getOptionLabel?: (item: SelectableValue<T>) => string;
  getOptionValue?: (item: SelectableValue<T>) => string;
  onChange: (item: SelectableValue<T>) => {} | void;
  placeholder?: string;
  width?: number;
  value?: SelectableValue<T>;
  className?: string;
  isDisabled?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  autoFocus?: boolean;
  openMenuOnFocus?: boolean;
  onBlur?: () => void;
  maxMenuHeight?: number;
  isLoading?: boolean;
  noOptionsMessage?: () => string;
  isMulti?: boolean;
  backspaceRemovesValue?: boolean;
  isOpen?: boolean;
  components?: any;
  tooltipContent?: PopoverContent;
  onOpenMenu?: () => void;
  onCloseMenu?: () => void;
  tabSelectsValue?: boolean;
}

export interface SelectProps<T> extends CommonProps<T> {
  options: Array<SelectableValue<T>>;
}

interface AsyncProps<T> extends CommonProps<T> {
  defaultOptions: boolean;
  loadOptions: (query: string) => Promise<Array<SelectableValue<T>>>;
  loadingMessage?: () => string;
}

export const MenuList = (props: any) => {
  return (
    <components.MenuList {...props}>
      <CustomScrollbar autoHide={false} autoHeightMax="inherit">
        {props.children}
      </CustomScrollbar>
    </components.MenuList>
  );
};

export class Select<T> extends PureComponent<SelectProps<T>> {
  static defaultProps: Partial<SelectProps<any>> = {
    className: '',
    isDisabled: false,
    isSearchable: true,
    isClearable: false,
    isMulti: false,
    openMenuOnFocus: false,
    autoFocus: false,
    isLoading: false,
    backspaceRemovesValue: true,
    maxMenuHeight: 300,
    tabSelectsValue: true,
    components: {
      Option: SelectOption,
      SingleValue,
      IndicatorsContainer,
      MenuList,
      Group: SelectOptionGroup,
    },
  };

  render() {
    const {
      defaultValue,
      getOptionLabel,
      getOptionValue,
      onChange,
      options,
      placeholder,
      width,
      value,
      className,
      isDisabled,
      isLoading,
      isSearchable,
      isClearable,
      backspaceRemovesValue,
      isMulti,
      autoFocus,
      openMenuOnFocus,
      onBlur,
      maxMenuHeight,
      noOptionsMessage,
      isOpen,
      components,
      tooltipContent,
      tabSelectsValue,
      onCloseMenu,
      onOpenMenu,
    } = this.props;

    let widthClass = '';
    if (width) {
      widthClass = 'width-' + width;
    }

    const selectClassNames = classNames('gf-form-input', 'gf-form-input--form-dropdown', widthClass, className);
    const selectComponents = { ...Select.defaultProps.components, ...components };

    return (
      <WrapInTooltip onCloseMenu={onCloseMenu} onOpenMenu={onOpenMenu} tooltipContent={tooltipContent} isOpen={isOpen}>
        {(onOpenMenuInternal, onCloseMenuInternal) => {
          return (
            <ReactSelect
              classNamePrefix="gf-form-select-box"
              className={selectClassNames}
              components={selectComponents}
              defaultValue={defaultValue}
              value={value}
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              menuShouldScrollIntoView={false}
              isSearchable={isSearchable}
              onChange={onChange}
              options={options}
              placeholder={placeholder || 'Choose'}
              styles={resetSelectStyles()}
              isDisabled={isDisabled}
              isLoading={isLoading}
              isClearable={isClearable}
              autoFocus={autoFocus}
              onBlur={onBlur}
              openMenuOnFocus={openMenuOnFocus}
              maxMenuHeight={maxMenuHeight}
              noOptionsMessage={noOptionsMessage}
              isMulti={isMulti}
              backspaceRemovesValue={backspaceRemovesValue}
              menuIsOpen={isOpen}
              onMenuOpen={onOpenMenuInternal}
              onMenuClose={onCloseMenuInternal}
              tabSelectsValue={tabSelectsValue}
            />
          );
        }}
      </WrapInTooltip>
    );
  }
}

export class AsyncSelect<T> extends PureComponent<AsyncProps<T>> {
  static defaultProps: Partial<AsyncProps<any>> = {
    className: '',
    components: {},
    loadingMessage: () => 'Loading...',
    isDisabled: false,
    isClearable: false,
    isMulti: false,
    isSearchable: true,
    backspaceRemovesValue: true,
    autoFocus: false,
    openMenuOnFocus: false,
    maxMenuHeight: 300,
  };

  render() {
    const {
      defaultValue,
      getOptionLabel,
      getOptionValue,
      onChange,
      placeholder,
      width,
      value,
      className,
      loadOptions,
      defaultOptions,
      isLoading,
      loadingMessage,
      noOptionsMessage,
      isDisabled,
      isSearchable,
      isClearable,
      backspaceRemovesValue,
      autoFocus,
      onBlur,
      openMenuOnFocus,
      maxMenuHeight,
      isMulti,
      tooltipContent,
      onCloseMenu,
      onOpenMenu,
      isOpen,
    } = this.props;

    let widthClass = '';
    if (width) {
      widthClass = 'width-' + width;
    }

    const selectClassNames = classNames('gf-form-input', 'gf-form-input--form-dropdown', widthClass, className);

    return (
      <WrapInTooltip onCloseMenu={onCloseMenu} onOpenMenu={onOpenMenu} tooltipContent={tooltipContent} isOpen={isOpen}>
        {(onOpenMenuInternal, onCloseMenuInternal) => {
          return (
            <ReactAsyncSelect
              classNamePrefix="gf-form-select-box"
              className={selectClassNames}
              components={{
                Option: SelectOption,
                SingleValue,
                IndicatorsContainer,
                NoOptionsMessage,
              }}
              defaultValue={defaultValue}
              value={value}
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              menuShouldScrollIntoView={false}
              onChange={onChange}
              loadOptions={loadOptions}
              isLoading={isLoading}
              defaultOptions={defaultOptions}
              placeholder={placeholder || 'Choose'}
              styles={resetSelectStyles()}
              loadingMessage={loadingMessage}
              noOptionsMessage={noOptionsMessage}
              isDisabled={isDisabled}
              isSearchable={isSearchable}
              isClearable={isClearable}
              autoFocus={autoFocus}
              onBlur={onBlur}
              openMenuOnFocus={openMenuOnFocus}
              maxMenuHeight={maxMenuHeight}
              isMulti={isMulti}
              backspaceRemovesValue={backspaceRemovesValue}
            />
          );
        }}
      </WrapInTooltip>
    );
  }
}

export interface TooltipWrapperProps {
  children: (onOpenMenu: () => void, onCloseMenu: () => void) => React.ReactNode;
  onOpenMenu?: () => void;
  onCloseMenu?: () => void;
  isOpen?: boolean;
  tooltipContent?: PopoverContent;
}

export interface TooltipWrapperState {
  isOpenInternal: boolean;
}

export class WrapInTooltip extends PureComponent<TooltipWrapperProps, TooltipWrapperState> {
  state: TooltipWrapperState = {
    isOpenInternal: false,
  };

  onOpenMenu = () => {
    const { onOpenMenu } = this.props;
    if (onOpenMenu) {
      onOpenMenu();
    }
    this.setState({ isOpenInternal: true });
  };

  onCloseMenu = () => {
    const { onCloseMenu } = this.props;
    if (onCloseMenu) {
      onCloseMenu();
    }
    this.setState({ isOpenInternal: false });
  };

  render() {
    const { children, isOpen, tooltipContent } = this.props;
    const { isOpenInternal } = this.state;

    let showTooltip: boolean | undefined = undefined;

    if (isOpenInternal || isOpen) {
      showTooltip = false;
    }

    if (tooltipContent) {
      return (
        <Tooltip show={showTooltip} content={tooltipContent} placement="bottom">
          <div>
            {/* div needed for tooltip */}
            {children(this.onOpenMenu, this.onCloseMenu)}
          </div>
        </Tooltip>
      );
    } else {
      return <div>{children(this.onOpenMenu, this.onCloseMenu)}</div>;
    }
  }
}

export default Select;
