import _ from 'lodash';
import React from 'react';

import CustomScrollbars from './CustomScrollbars';

const methodsToBind = [
  'getListPadding',
  'getViewportLimits',
  'handleScrollStop',
  'postponeRerender',
  'setScrollPosition',
  'setViewportHeight'
];

let cachedList = null;

class ListViewport extends React.Component {
  constructor() {
    super();

    this.lastScrollPosition = 0;
    this.postponedRerender = false;
    this.nodeRefs = {};
    this.state = {
      itemHeight: null,
      scrollPosition: 0
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.setViewportHeight = _.debounce(this.setViewportHeight, 250);
    this.postponeRerender = _.debounce(this.postponeRerender, 500);
    this.setScrollPosition = _.throttle(this.setScrollPosition, 250, {
      trailing: true
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.setViewportHeight);
    this.setViewportHeight();
  }

  componentDidUpdate() {
    if (this.state.itemHeight == null && this.nodeRefs.topSpacer != null) {
      this.setState({
        itemHeight: this.nodeRefs.topSpacer.nextSibling.offsetHeight
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setViewportHeight);
  }

  getViewportLimits() {
    if (this.state.itemHeight == null) {
      return {minItemIndex: 0, maxItemIndex: 1};
    }

    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outide of the
    // container's dimensions, which looks nicer when the user scrolls.
    let offset = 0;

    if (this.postponedRerender === false
      && !this.nodeRefs.list.refs.scrollbar.dragging) {
      offset = 20;
    }

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    let elementsInView = Math.ceil(this.state.viewportHeight /
      this.state.itemHeight);

    // The minimum item index to render is the number of items above the
    // viewport's current scroll position, minus the offset.
    let minItemIndex = Math.max(
      0, Math.floor(this.state.scrollPosition / this.state.itemHeight) - offset
    );

    // The maximum item index to render is the minimum item rendered, plus the
    // number of items in view, plus double the offset.
    let maxItemIndex = Math.min(
      this.props.listLength, minItemIndex + elementsInView + offset * 2
    );

    return {minItemIndex, maxItemIndex};
  }

  handleScrollStop() {
    // Force update as soon as scrolling stops.
    this.postponedRerender = false;
    this.forceUpdate();
  }

  postponeRerender() {
    global.requestAnimationFrame(() => {
      this.postponedRerender = false;
      this.forceUpdate();
    });
  }

  getListPadding(minItemIndex, maxItemIndex, itemCount) {
    if (this.state.itemHeight == null) {
      return {bottom: 0, top: 0};
    }

    // Calculate the number of pixels to pad the visible item list.
    // If the minimum item index is less than 0, then we're already at the top
    // of the list and don't need to render any padding there.
    if (minItemIndex < 0) {
      minItemIndex = 0;
    }

    if (maxItemIndex > itemCount) {
      maxItemIndex = itemCount;
    }

    let hiddenBottom = itemCount - maxItemIndex;
    let hiddenTop = minItemIndex;

    let bottom = hiddenBottom * this.state.itemHeight;
    let top = hiddenTop * this.state.itemHeight;

    return {bottom, top};
  }

  setScrollPosition(scrollValues) {
    global.requestAnimationFrame(() => {
      const {scrollTop} = scrollValues;
      this.setState({scrollPosition: scrollTop});
      this.lastScrollPosition = scrollTop;
    });
  }

  setViewportHeight() {
    const {nodeRefs} = this;

    if (nodeRefs.list) {
      this.setState({
        viewportHeight: nodeRefs.list.refs.scrollbar.getClientHeight()
      });
    }
  }

  render() {
    const {lastScrollPosition, nodeRefs, props, state} = this;
    const scrollDelta = Math.abs(state.scrollPosition - lastScrollPosition);

    let listContent = null;

    if (nodeRefs.list != null) {
      // If the list is cached and the user is scrolling a large amount,
      // or the user is dragging the scroll handle, then we postpone the list's
      // rerender for better FPS.
      if ((cachedList != null && scrollDelta > 1000)
        || nodeRefs.list.refs.scrollbar.dragging === true) {
        this.postponedRerender = true;
        listContent = cachedList;

        global.requestAnimationFrame(() => this.postponeRerender());
      } else {
        const {minItemIndex, maxItemIndex} = this.getViewportLimits();
        const listPadding = this.getListPadding(
          minItemIndex, maxItemIndex, props.listLength
        );

        let list = [];

        for (let index = minItemIndex; index < maxItemIndex; index++) {
          list.push(props.itemRenderer(index));
        }

        listContent = (
          <ul className={props.listClass}>
            <li className={props.topSpacerClass}
              ref={(ref) => nodeRefs.topSpacer = ref}
              style={{height: `${listPadding.top}px`}}></li>
            {list}
            <li className={props.bottomSpacerClass}
              style={{height: `${listPadding.bottom}px`}}></li>
          </ul>
        );

        cachedList = listContent;
      }
    }

    return (
      <CustomScrollbars className={props.scrollContainerClass}
        onScrollStop={this.handleScrollStop}
        ref={(ref) => this.nodeRefs.list = ref}
        scrollHandler={this.setScrollPosition}>
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
