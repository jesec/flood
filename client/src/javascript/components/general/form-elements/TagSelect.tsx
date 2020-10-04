import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';
import React, {Component} from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import {ContextMenu, FormElementAddon, FormRowItem, Portal, SelectItem, Textbox} from '../../../ui';
import Chevron from '../../../ui/icons/Chevron';
import TorrentFilterStore from '../../../stores/TorrentFilterStore';

interface TagSelectProps {
  id?: string;
  label?: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
}

interface TagSelectStates {
  isOpen: boolean;
  selectedTags: TorrentProperties['tags'];
}

export default class TagSelect extends Component<TagSelectProps, TagSelectStates> {
  menuRef: HTMLDivElement | null = null;

  textboxRef: HTMLInputElement | null = null;

  tagMenuItems = Object.keys(TorrentFilterStore.getTorrentTagCount()).reduce(
    (accumulator: React.ReactNodeArray, tag) => {
      if (tag === 'all') {
        return accumulator;
      }

      if (tag === 'untagged') {
        accumulator.push(
          <SelectItem id={tag} key={tag}>
            <FormattedMessage id="filter.untagged" />
          </SelectItem>,
        );
        return accumulator;
      }

      accumulator.push(
        <SelectItem id={tag} key={tag}>
          {tag}
        </SelectItem>,
      );
      return accumulator;
    },
    [],
  );

  constructor(props: TagSelectProps) {
    super(props);

    this.state = {
      isOpen: false,
      selectedTags: [],
    };
  }

  componentDidUpdate(_prevProps: TagSelectProps, prevState: TagSelectStates) {
    if (this.state.isOpen && !prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });
      document.addEventListener('click', this.toggleOpenState);
    } else if (!this.state.isOpen && prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });
      document.removeEventListener('click', this.toggleOpenState);
    }
  }

  getItemList(children: React.ReactNodeArray) {
    return children.reduce((accumulator: Array<React.ReactElement>, child) => {
      const item = child as SelectItem;

      if (item.props.placeholder) {
        return accumulator;
      }

      accumulator.push(
        React.cloneElement(child as React.ReactElement, {
          onClick: this.handleItemClick,
          isSelected: this.state.selectedTags.includes(item.props.id as string),
        }),
      );

      return accumulator;
    }, []);
  }

  handleItemClick = (tag: string) => {
    let {selectedTags} = this.state;

    if (tag === 'untagged') {
      selectedTags = [];
    } else if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((key) => key !== tag);
    } else {
      selectedTags.push(tag);
    }

    this.setState({selectedTags}, () => {
      if (this.textboxRef != null) {
        this.textboxRef.value = selectedTags.join();
      }
    });
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();

      this.setState({isOpen: false});
    }
  };

  handleWindowScroll = (event: Event) => {
    if (this.menuRef && !this.menuRef.contains(event.target as Node)) {
      if (this.state.isOpen) {
        this.setState({isOpen: false});
      }
    }
  };

  toggleOpenState = () => {
    const wasOpen = this.state.isOpen;
    this.setState({
      isOpen: !wasOpen,
    });
  };

  render() {
    const classes = classnames('select form__element', {
      'select--is-open': this.state.isOpen,
    });

    return (
      <FormRowItem>
        <label className="form__element__label">{this.props.label}</label>
        <div className={classes}>
          <Textbox
            id={this.props.id || 'tags'}
            addonPlacement="after"
            defaultValue={this.props.defaultValue}
            placeholder={this.props.placeholder}
            setRef={(ref) => {
              this.textboxRef = ref;
            }}>
            <FormElementAddon onClick={this.toggleOpenState} className="select__indicator">
              <Chevron />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                in={this.state.isOpen}
                onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                setRef={(ref) => {
                  this.menuRef = ref;
                }}
                triggerRef={this.textboxRef}>
                {this.getItemList(this.tagMenuItems)}
              </ContextMenu>
            </Portal>
          </Textbox>
        </div>
      </FormRowItem>
    );
  }
}
