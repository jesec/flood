import classnames from 'classnames';
import React from 'react';
import {positionValues, Scrollbars} from 'react-custom-scrollbars';

const horizontalThumb: React.StatelessComponent = (props) => {
  return <div {...props} className="scrollbars__thumb scrollbars__thumb--horizontal" />;
};

const verticalThumb: React.StatelessComponent = (props) => {
  return <div {...props} className="scrollbars__thumb scrollbars__thumb--vertical" />;
};

const renderView: React.StatelessComponent = (props) => {
  return (
    <div {...props} className="scrollbars__view">
      {props.children}
    </div>
  );
};

interface CustomScrollbarsProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  autoHeight?: boolean;
  autoHeightMin?: number | string;
  autoHeightMax?: number | string;
  inverted?: boolean;
  getHorizontalThumb?: React.StatelessComponent;
  getVerticalThumb?: React.StatelessComponent;
  nativeScrollHandler?: (event: React.UIEvent) => void;
  scrollHandler?: (values: positionValues) => void;
  onScrollStart?: () => void;
  onScrollStop?: () => void;
}

const CustomScrollbars = React.forwardRef<Scrollbars, CustomScrollbarsProps>((props: CustomScrollbarsProps, ref) => {
  const {
    children,
    className,
    style,
    autoHeight,
    autoHeightMin,
    autoHeightMax,
    inverted,
    getHorizontalThumb,
    getVerticalThumb,
    nativeScrollHandler,
    scrollHandler,
    onScrollStart,
    onScrollStop,
  } = props;
  const classes = classnames('scrollbars', className, {
    'is-inverted': inverted,
  });

  return (
    <Scrollbars
      className={classes}
      style={style}
      autoHeight={autoHeight}
      autoHeightMin={autoHeightMin}
      autoHeightMax={autoHeightMax}
      ref={ref}
      renderView={renderView}
      renderThumbHorizontal={getHorizontalThumb}
      renderThumbVertical={getVerticalThumb}
      onScroll={nativeScrollHandler}
      onScrollFrame={scrollHandler}
      onScrollStart={onScrollStart}
      onScrollStop={onScrollStop}>
      {children}
    </Scrollbars>
  );
});

CustomScrollbars.defaultProps = {
  className: '',
  style: undefined,
  autoHeight: undefined,
  autoHeightMin: undefined,
  autoHeightMax: undefined,
  inverted: undefined,
  getHorizontalThumb: horizontalThumb,
  getVerticalThumb: verticalThumb,
  nativeScrollHandler: undefined,
  scrollHandler: undefined,
  onScrollStart: undefined,
  onScrollStop: undefined,
};

export default CustomScrollbars;
