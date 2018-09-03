import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import CustomScrollbars from './CustomScrollbars';

const methodsToBind = [
  'getListPadding',
  'getViewportLimits',
  'handleScroll',
  'handleScrollStart',
  'handleScrollStop',
  'measureItemHeight',
  'scrollToTop',
  'setScrollPosition',
  'setViewportHeight',
];

class ListViewport extends React.Component {
  static defaultProps = {
    bottomSpacerClass: 'list__spacer list__spacer--bottom',
    itemScrollOffset: 10,
    topSpacerClass: 'list__spacer list__spacer--top',
  };

  static propTypes = {
    bottomSpacerClass: PropTypes.string,
    itemRenderer: PropTypes.func.isRequired,
    itemScrollOffset: PropTypes.number,
    listClass: PropTypes.string,
    listLength: PropTypes.number.isRequired,
    scrollContainerClass: PropTypes.string,
    topSpacerClass: PropTypes.string,
  };

  constructor() {
    super();

    this.isScrolling = false;
    this.lastScrollTop = 0;
    this.nodeRefs = {};
    this.state = {
      itemHeight: null,
      listVerticalPadding: null,
      scrollTop: 0,
      viewportHeight: null,
    };

    methodsToBind.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.setViewportHeight = _.debounce(this.setViewportHeight, 250);
    this.updateAfterScrolling = _.debounce(this.updateAfterScrolling, 500, {
      leading: true,
      trailing: true,
    });
    this.setScrollPosition = _.throttle(this.setScrollPosition, 100);
  }

  componentDidMount() {
    global.addEventListener('resize', this.setViewportHeight);
    this.setViewportHeight();
  }

  componentDidUpdate() {
    const {nodeRefs, state} = this;

    if (state.itemHeight == null && nodeRefs.topSpacer != null) {
      this.setState({
        itemHeight: nodeRefs.topSpacer.nextSibling.offsetHeight,
      });
    }

    if (state.listVerticalPadding == null && nodeRefs.list != null) {
      const listStyle = global.getComputedStyle(nodeRefs.list);
      const paddingBottom = Number(listStyle['padding-bottom'].replace('px', ''));
      const paddingTop = Number(listStyle['padding-top'].replace('px', ''));

      this.setState({
        listVerticalPadding: paddingBottom + paddingTop,
      });
    }
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.setViewportHeight);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const scrollDelta = Math.abs(this.state.scrollTop - nextState.scrollTop);

    if (this.isScrolling && scrollDelta > 20) {
      return false;
    }

    return true;
  }

  getViewportLimits(scrollDelta) {
    if (this.state.itemHeight == null) {
      return {
        minItemIndex: 0,
        maxItemIndex: Math.min(50, this.props.listLength),
      };
    }

    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outide of the
    // container's dimensions, which looks nicer when the user scrolls.
    const {itemScrollOffset} = this.props;
    const offsetBottom = scrollDelta > 0 ? itemScrollOffset * 2 : itemScrollOffset / 2;
    const offsetTop = scrollDelta < 0 ? itemScrollOffset * 2 : itemScrollOffset / 2;

    let {itemHeight, listVerticalPadding, scrollTop, viewportHeight} = this.state;

    if (listVerticalPadding) {
      viewportHeight = viewportHeight - listVerticalPadding;
    }

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    const elementsInView = Math.ceil(viewportHeight / itemHeight);

    // The minimum item index to render is the number of items above the
    // viewport's current scroll position, minus the offset.
    const minItemIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - offsetTop);

    // The maximum item index to render is the minimum item rendered, plus the
    // number of items in view, plus double the offset.
    let maxItemIndex = Math.min(this.props.listLength, minItemIndex + elementsInView + offsetBottom + offsetTop);

    return {minItemIndex, maxItemIndex};
  }

  handleScroll(scrollValues) {
    this.setScrollPosition(scrollValues);
  }

  handleScrollStart() {
    this.isScrolling = true;
  }

  handleScrollStop() {
    this.isScrolling = false;
    this.updateAfterScrolling();
  }

  measureItemHeight() {
    this.lastScrollTop = 0;

    this.setState(
      {
        scrollTop: 0,
        itemHeight: null,
      },
      () => {
        this.nodeRefs.outerScrollbar.scrollbarRef.scrollTop(0);
      }
    );
  }

  getListPadding(minItemIndex, maxItemIndex, itemCount) {
    const {itemHeight} = this.state;

    if (itemHeight == null) {
      return {bottom: 0, top: 0};
    }

    // Calculate the number of pixels to pad the visible item list.
    // If the minimum item index is less than 0, then we're already at the top
    // of the list and don't need to render any padding.
    if (minItemIndex < 0) {
      minItemIndex = 0;
    }

    // If the max item index is larger than the item count, then we're at the
    // bottom of the list and don't need to render any padding.
    if (maxItemIndex > itemCount) {
      maxItemIndex = itemCount;
    }

    const bottom = (itemCount - maxItemIndex) * itemHeight;
    const top = minItemIndex * itemHeight;

    return {bottom, top};
  }

  scrollToTop() {
    if (this.state.scrollTop !== 0) {
      if (this.nodeRefs.outerScrollbar != null) {
        this.nodeRefs.outerScrollbar.scrollbarRef.scrollToTop();
      }

      this.lastScrollTop = 0;
      this.setState({scrollTop: 0});
    }
  }

  setScrollPosition(scrollValues) {
    this.lastScrollTop = this.state.scrollTop;
    this.setState({scrollTop: scrollValues.scrollTop});
  }

  setViewportHeight() {
    const {nodeRefs} = this;

    if (nodeRefs.outerScrollbar) {
      this.setState({
        viewportHeight: nodeRefs.outerScrollbar.scrollbarRef.getClientHeight(),
      });
    }
  }

  updateAfterScrolling() {
    this.forceUpdate();
  }

  render() {
    const {lastScrollTop, nodeRefs, props, state} = this;
    const {minItemIndex, maxItemIndex} = this.getViewportLimits(state.scrollTop - lastScrollTop);
    const listPadding = this.getListPadding(minItemIndex, maxItemIndex, props.listLength);
    const list = [];

    // For loops are fast, and performance matters here.
    for (let index = minItemIndex; index < maxItemIndex; index++) {
      list.push(props.itemRenderer(index));
    }

    const listContent = (
      <ul className={props.listClass} ref={ref => (nodeRefs.list = ref)}>
        <li
          className={props.topSpacerClass}
          ref={ref => (nodeRefs.topSpacer = ref)}
          style={{height: `${listPadding.top}px`}}
        />
        {list}
        <li className={props.bottomSpacerClass} style={{height: `${listPadding.bottom}px`}} />
      </ul>
    );

    const scrollbarStyle = {};

    if (props.width != null) {
      scrollbarStyle.width = props.width;
    }

    return (
      <CustomScrollbars
        className={props.scrollContainerClass}
        getVerticalThumb={props.getVerticalThumb}
        onScrollStart={this.handleScrollStart}
        onScrollStop={this.handleScrollStop}
        ref={ref => (this.nodeRefs.outerScrollbar = ref)}
        scrollHandler={this.handleScroll}
        style={scrollbarStyle}>
        {props.children}
        {listContent}
      </CustomScrollbars>
    );
  }
}

export default ListViewport;
