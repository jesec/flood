import classnames from 'classnames';
import * as React from 'react';
import * as styles from './Icon.scss';

enum Fills {
  NONE,
  CURRENT_COLOR,
}

enum Sizes {
  SMALL,
  MEDIUM,
}

interface Props {
  className?: string;
  fill: Fills;
  glyph: string;
  size: Sizes;
}

export default class Icon extends React.PureComponent<Props> {
  public static Fills = Fills;

  public static Sizes = Sizes;

  public static defaultProps = {
    fill: Fills.CURRENT_COLOR,
    size: Sizes.MEDIUM,
  };

  public render(): React.ReactNode {
    const {className, fill, glyph, size, ...restProps} = this.props;

    return (
      <svg
        className={classnames(styles.icon, className, {
          [styles.fillCurrentColor]: fill === Fills.CURRENT_COLOR,
          [styles.sizeMedium]: size === Sizes.MEDIUM,
          [styles.sizeSmall]: size === Sizes.SMALL,
        })}
        {...restProps}>
        <use xlinkHref={`#${glyph}`} />
      </svg>
    );
  }
}
