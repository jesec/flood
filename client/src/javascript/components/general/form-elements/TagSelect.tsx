import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';
import * as React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import {ContextMenu, FormElementAddon, FormRowItem, Portal, SelectItem, Textbox} from '../../../ui';
import Chevron from '../../../ui/icons/Chevron';
import TorrentFilterStore from '../../../stores/TorrentFilterStore';

interface TagSelectProps {
  id?: string;
  label?: React.ReactNode;
  defaultValue?: TorrentProperties['tags'];
  placeholder?: string;
}

interface TagSelectStates {
  isOpen: boolean;
  selectedTags: TorrentProperties['tags'];
}

export default class TagSelect extends React.Component<TagSelectProps, TagSelectStates> {
  formRowRef = React.createRef<HTMLDivElement>();
  menuRef = React.createRef<HTMLDivElement>();
  textboxRef: HTMLInputElement | null = null;

  tagMenuItems = Object.keys(TorrentFilterStore.taxonomy.tagCounts).reduce((accumulator: React.ReactNodeArray, tag) => {
    if (tag === '') {
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
  }, []);

  constructor(props: TagSelectProps) {
    super(props);

    const {defaultValue} = this.props;

    this.state = {
      isOpen: false,
      selectedTags: defaultValue != null ? defaultValue : [],
    };
  }

  componentDidUpdate(_prevProps: TagSelectProps, prevState: TagSelectStates) {
    const {isOpen} = this.state;

    if (isOpen && !prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });
      document.addEventListener('click', this.handleDocumentClick);
    } else if (!isOpen && prevState.isOpen) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('scroll', this.handleWindowScroll, {
        capture: true,
      });
      document.removeEventListener('click', this.handleDocumentClick);
    }
  }

  getItemList(children: React.ReactNodeArray) {
    return children.reduce((accumulator: Array<React.ReactElement>, child) => {
      const item = child as SelectItem;

      if (item.props.placeholder) {
        return accumulator;
      }

      const {selectedTags} = this.state;

      accumulator.push(
        React.cloneElement(child as React.ReactElement, {
          onClick: this.handleItemClick,
          isSelected: selectedTags.includes(item.props.id as string),
        }),
      );

      return accumulator;
    }, []);
  }

  handleDocumentClick = (e: Event) => {
    if (!this.formRowRef.current?.contains((e.target as unknown) as Node)) {
      this.toggleOpenState();
    }
  };

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
    if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
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
    const {defaultValue, placeholder, id, label} = this.props;
    const {isOpen} = this.state;

    const classes = classnames('select form__element', {
      'select--is-open': isOpen,
    });

    return (
      <FormRowItem ref={this.formRowRef}>
        <label className="form__element__label">{label}</label>
        <div className={classes}>
          <Textbox
            id={id || 'tags'}
            addonPlacement="after"
            defaultValue={defaultValue}
            placeholder={placeholder}
            setRef={(ref) => {
              this.textboxRef = ref;
            }}>
            <FormElementAddon onClick={this.toggleOpenState} className="select__indicator">
              <Chevron />
            </FormElementAddon>
            <Portal>
              <ContextMenu
                isIn={isOpen}
                onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
                overlayProps={{isInteractive: false}}
                ref={this.menuRef}
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
