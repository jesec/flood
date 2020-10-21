import debounce from 'lodash/debounce';
import React from 'react';
import {positionValues, Scrollbars} from 'react-custom-scrollbars';
import throttle from 'lodash/throttle';

import CustomScrollbars from './CustomScrollbars';

const METHODS_TO_BIND = [
  'handleScroll',
  'handleScrollStart',
  'handleScrollStop',
  'measureItemHeight',
  'scrollToTop',
  'setScrollPosition',
  'setViewportHeight',
] as const;

interface ListViewportProps {
  itemRenderer: (index: number) => React.ReactNode;
  listClass: string;
  listLength: number;
  scrollContainerClass: string;
  topSpacerClass?: string;
  bottomSpacerClass?: string;
  itemScrollOffset?: number;
  getVerticalThumb?: React.StatelessComponent;
}

interface ListViewportStates {
  itemHeight: number | null;
  listVerticalPadding: number | null;
  scrollTop: number;
  viewportHeight: number | null;
}

class ListViewport extends React.Component<ListViewportProps, ListViewportStates> {
  scrollbarRef: Scrollbars | null = null;
  listRef: HTMLUListElement | null = null;
  topSpacerRef: HTMLLIElement | null = null;
  isScrolling = false;
  lastScrollTop = 0;

  static defaultProps = {
    bottomSpacerClass: 'list__spacer list__spacer--bottom',
    itemScrollOffset: 10,
    topSpacerClass: 'list__spacer list__spacer--top',
  };

  constructor(props: ListViewportProps) {
    super(props);

    this.state = {
      itemHeight: null,
      listVerticalPadding: null,
      scrollTop: 0,
      viewportHeight: null,
    };

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });

    this.setViewportHeight = debounce(this.setViewportHeight, 250);
    this.updateAfterScrolling = debounce(this.updateAfterScrolling, 500, {
      leading: true,
      trailing: true,
    });
    this.setScrollPosition = throttle(this.setScrollPosition, 100);
  }

  componentDidMount() {
    global.addEventListener('resize', this.setViewportHeight);
    this.setViewportHeight();
  }

  shouldComponentUpdate(_nextProps: ListViewportProps, nextState: ListViewportStates) {
    const {scrollTop} = this.state;
    const scrollDelta = Math.abs(scrollTop - nextState.scrollTop);

    if (this.isScrolling && scrollDelta > 20) {
      return false;
    }

    return true;
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.setViewportHeight);
  }

  getViewportLimits(scrollDelta: number) {
    const {itemScrollOffset, listLength} = this.props;
    const {itemHeight, listVerticalPadding, scrollTop, viewportHeight} = this.state;

    if (
      itemHeight == null ||
      itemHeight <= 0 ||
      itemScrollOffset == null ||
      viewportHeight == null ||
      viewportHeight <= 0
    ) {
      return {
        minItemIndex: 0,
        maxItemIndex: Math.min(50, listLength),
      };
    }

    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outside of the
    // container's dimensions, which looks nicer when the user scrolls.
    const offsetBottom = scrollDelta > 0 ? itemScrollOffset * 2 : itemScrollOffset / 2;
    const offsetTop = scrollDelta < 0 ? itemScrollOffset * 2 : itemScrollOffset / 2;

    let viewportHeightPadded = viewportHeight;

    if (listVerticalPadding) {
      viewportHeightPadded -= listVerticalPadding;
    }

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    const elementsInView = Math.ceil(viewportHeightPadded / itemHeight);

    // The minimum item index to render is the number of items above the
    // viewport's current scroll position, minus the offset.
    const minItemIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - offsetTop);

    // The maximum item index to render is the minimum item rendered, plus the
    // number of items in view, plus double the offset.
    const maxItemIndex = Math.min(listLength, minItemIndex + elementsInView + offsetBottom + offsetTop);

    return {minItemIndex, maxItemIndex};
  }

  getListPadding(minItemIndex: number, maxItemIndex: number, itemCount: number) {
    const {itemHeight} = this.state;

    if (itemHeight == null) {
      return {bottom: 0, top: 0};
    }

    const bottom = (itemCount - maxItemIndex) * itemHeight;
    const top = minItemIndex * itemHeight;

    return {bottom, top};
  }

  setScrollPosition(scrollValues: positionValues) {
    const {scrollTop} = this.state;

    this.lastScrollTop = scrollTop;
    this.setState({scrollTop: scrollValues.scrollTop});
  }

  setViewportHeight() {
    if (this.scrollbarRef) {
      this.setState({
        viewportHeight: this.scrollbarRef.getClientHeight(),
      });
    }
  }

  scrollToTop() {
    const {scrollTop} = this.state;

    if (scrollTop !== 0) {
      if (this.scrollbarRef != null) {
        this.scrollbarRef.scrollToTop();
      }

      this.lastScrollTop = 0;
      this.setState({scrollTop: 0});
    }
  }

  measureItemHeight() {
    this.lastScrollTop = 0;

    this.setState(
      {
        scrollTop: 0,
        itemHeight: null,
      },
      () => {
        if (this.scrollbarRef != null) {
          this.scrollbarRef.scrollTop(0);
        }
      },
    );
  }

  handleScroll(scrollValues: positionValues) {
    this.setScrollPosition(scrollValues);
  }

  handleScrollStart() {
    this.isScrolling = true;
  }

  handleScrollStop() {
    this.isScrolling = false;
    this.updateAfterScrolling();
  }

  updateAfterScrolling() {
    this.forceUpdate();
  }

  render() {
    const {
      children,
      listClass,
      topSpacerClass,
      bottomSpacerClass,
      scrollContainerClass,
      listLength,
      getVerticalThumb,
      itemRenderer,
    } = this.props;
    const {itemHeight, scrollTop, listVerticalPadding} = this.state;

    const {minItemIndex, maxItemIndex} = this.getViewportLimits(scrollTop - this.lastScrollTop);
    const listPadding = this.getListPadding(minItemIndex, maxItemIndex, listLength);
    const list = [];

    // For loops are fast, and performance matters here.
    for (let index = minItemIndex; index < maxItemIndex; index += 1) {
      list.push(itemRenderer(index));
    }

    const listContent = (
      <ul
        className={listClass}
        ref={(ref) => {
          this.listRef = ref;

          if (listVerticalPadding == null && this.listRef != null) {
            const listStyle = global.getComputedStyle(this.listRef);
            const paddingBottom = Number(listStyle.getPropertyValue('padding-bottom').replace('px', ''));
            const paddingTop = Number(listStyle.getPropertyValue('padding-top').replace('px', ''));

            this.setState({
              listVerticalPadding: paddingBottom + paddingTop,
            });
          }
        }}>
        <li
          className={topSpacerClass}
          ref={(ref) => {
            this.topSpacerRef = ref;

            if (itemHeight == null && this.topSpacerRef?.nextSibling != null) {
              this.setState({
                itemHeight: (this.topSpacerRef.nextSibling as HTMLLIElement).offsetHeight,
              });
            }
          }}
          style={{height: `${listPadding.top}px`}}
        />
        {list}
        <li className={bottomSpacerClass} style={{height: `${listPadding.bottom}px`}} />
      </ul>
    );

    return (
      <CustomScrollbars
        className={scrollContainerClass}
        getVerticalThumb={getVerticalThumb}
        onScrollStart={this.handleScrollStart}
        onScrollStop={this.handleScrollStop}
        ref={(ref) => {
          this.scrollbarRef = ref;
        }}
        scrollHandler={this.handleScroll}>
        {children}
        {listContent}
      </CustomScrollbars>
    );
  }
}

export default ListViewport;
