import _ from 'lodash';
import React from 'react';

import CustomScrollbars from './CustomScrollbars';

const methodsToBind = [
  'getListPadding',
  'getViewportLimits',
  'handleScroll',
  'handleScrollStart',
  'handleScrollStop',
  'measureItemHeight',
  'setScrollPosition',
  'setViewportHeight'
];

let cachedList = null;

class ListViewport extends React.Component {
  constructor() {
    super();

    this.lastScrollTop = 0;
    this.nodeRefs = {};
    this.state = {
      isScrolling: false,
      itemHeight: null,
      listVerticalPadding: null,
      scrollTop: 0,
      viewportHeight: null
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.setViewportHeight = _.debounce(this.setViewportHeight, 250);
    this.setScrollPosition = _.throttle(this.setScrollPosition, 100, {
      trailing: true
    });
  }

  componentDidMount() {
    global.addEventListener('resize', this.setViewportHeight);
    this.setViewportHeight();
  }

  componentDidUpdate() {
    const {nodeRefs, state} = this;

    if (state.itemHeight == null && nodeRefs.topSpacer != null) {
      this.setState({
        itemHeight: nodeRefs.topSpacer.nextSibling.offsetHeight
      });
    }

    if (state.listVerticalPadding == null && nodeRefs.list != null) {
      const listStyle = global.getComputedStyle(nodeRefs.list);
      const paddingBottom = Number(listStyle['padding-bottom'].replace('px', ''));
      const paddingTop = Number(listStyle['padding-top'].replace('px', ''));

      this.setState({
        listVerticalPadding: paddingBottom + paddingTop
      });
    }
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.setViewportHeight);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const scrollDelta = nextState.scrollTop - this.lastScrollTop;
    const {outerScrollbar} = this.nodeRefs;

    if ((nextState.isScrolling && (scrollDelta > 1000 || scrollDelta < -1000))
      || (outerScrollbar != null && outerScrollbar.refs.scrollbar.dragging)) {
      return false;
    }

    return true;
  }

  getViewportLimits(scrollDelta) {
    if (this.state.itemHeight == null) {
      return {minItemIndex: 0, maxItemIndex: 50};
    }

    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outide of the
    // container's dimensions, which looks nicer when the user scrolls.
    let offsetBottom = 1;
    let offsetTop = 1;

    if (!this.nodeRefs.outerScrollbar.refs.scrollbar.dragging) {
      if (scrollDelta < 0) {
        offsetTop = 18;
      } else if (scrollDelta > 0) {
        offsetBottom = 18;
      } else {
        offsetBottom = 10;
        offsetTop = 10;
      }
    }

    let {
      itemHeight,
      listVerticalPadding,
      scrollTop,
      viewportHeight
    } = this.state;

    if (listVerticalPadding) {
      viewportHeight = viewportHeight - listVerticalPadding;
    }

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    const elementsInView = Math.ceil(viewportHeight / itemHeight);

    // The minimum item index to render is the number of items above the
    // viewport's current scroll position, minus the offset.
    const minItemIndex = Math.max(
      0, Math.floor(scrollTop / itemHeight) - offsetTop
    );

    // The maximum item index to render is the minimum item rendered, plus the
    // number of items in view, plus double the offset.
    let maxItemIndex = Math.min(
      this.props.listLength,
      minItemIndex + elementsInView + offsetBottom + offsetTop
    );

    return {minItemIndex, maxItemIndex};
  }

  handleScroll(scrollValues) {
    this.setScrollPosition(scrollValues);
  }

  handleScrollStart() {
    this.setState({isScrolling: true});
  }

  handleScrollStop() {
    this.setState({isScrolling: false});
  }

  measureItemHeight() {
    this.lastScrollTop = 0;

    this.setState({
      scrollTop: 0,
      itemHeight: null
    }, () => {
      this.nodeRefs.outerScrollbar.refs.scrollbar.scrollTop(0);
    });
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

  setScrollPosition(scrollValues) {
    this.lastScrollTop = this.state.scrollTop;
    this.setState({scrollTop: scrollValues.scrollTop});
  }

  setViewportHeight() {
    const {nodeRefs} = this;

    if (nodeRefs.outerScrollbar) {
      this.setState({
        viewportHeight: nodeRefs.outerScrollbar.refs.scrollbar.getClientHeight()
      });
    }
  }

  render() {
    const {lastScrollTop, nodeRefs, props, state} = this;
    const {minItemIndex, maxItemIndex} = this.getViewportLimits(
      state.scrollTop - lastScrollTop
    );
    const listPadding = this.getListPadding(
      minItemIndex, maxItemIndex, props.listLength
    );
    const list = [];

    // For loops are fast, and performance matters here.
    for (let index = minItemIndex; index < maxItemIndex; index++) {
      list.push(props.itemRenderer(index, props.itemRendererProps));
    }

    const listContent = (
      <ul className={props.listClass} ref={ref => nodeRefs.list = ref}>
        <li className={props.topSpacerClass}
          ref={ref => nodeRefs.topSpacer = ref}
          style={{height: `${listPadding.top}px`}}></li>
        {list}
        <li className={props.bottomSpacerClass}
          style={{height: `${listPadding.bottom}px`}}></li>
      </ul>
    );

    const scrollbarStyle = {};

    if (props.width != null) {
      scrollbarStyle.width = props.width;
    }

    return (
      <CustomScrollbars className={props.scrollContainerClass}
        getVerticalThumb={props.getVerticalThumb}
        onScrollStart={this.handleScrollStart}
        onScrollStop={this.handleScrollStop}
        ref={ref => this.nodeRefs.outerScrollbar = ref}
        scrollHandler={this.handleScroll}
        style={scrollbarStyle}>
        {props.children}
        {listContent}
      </CustomScrollbars>
    );
  }
}

ListViewport.defaultProps = {
  bottomSpacerClass: 'list__spacer list__spacer--bottom',
  topSpacerClass: 'list__spacer list__spacer--top'
};

ListViewport.propTypes = {
  bottomSpacerClass: React.PropTypes.string,
  itemRenderer: React.PropTypes.func.isRequired,
  listClass: React.PropTypes.string,
  listLength: React.PropTypes.number.isRequired,
  scrollContainerClass: React.PropTypes.string,
  topSpacerClass: React.PropTypes.string
};

export default ListViewport;
