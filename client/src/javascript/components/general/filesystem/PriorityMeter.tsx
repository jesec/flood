import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import PriorityLevels from '../../../constants/PriorityLevels';

interface PriorityMeterProps extends WrappedComponentProps {
  id: string | number;
  level: number;
  maxLevel: number;
  priorityType: keyof typeof PriorityLevels;
  showLabel?: boolean;
  clickHandled?: boolean;
  onChange: (id: this['id'], level: this['level']) => void;
}

interface PriorityMeterStates {
  optimisticData: {
    level: number | null;
  };
}

const METHODS_TO_BIND = ['handleClick'] as const;

class PriorityMeter extends React.Component<PriorityMeterProps, PriorityMeterStates> {
  constructor(props: PriorityMeterProps) {
    super(props);

    this.state = {
      optimisticData: {
        level: null,
      },
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getPriorityLabel() {
    const priorityLevel = PriorityLevels[this.props.priorityType];
    switch (priorityLevel[this.getPriorityLevel() as keyof typeof priorityLevel]) {
      case 'DONT_DOWNLOAD':
        return this.props.intl.formatMessage({
          id: 'priority.dont.download',
        });
      case 'HIGH':
        return this.props.intl.formatMessage({
          id: 'priority.high',
        });
      case 'LOW':
        return this.props.intl.formatMessage({
          id: 'priority.low',
        });
      case 'NORMAL':
        return this.props.intl.formatMessage({
          id: 'priority.normal',
        });
      default:
        return '';
    }
  }

  getPriorityLevel() {
    if (this.state.optimisticData.level != null) {
      return this.state.optimisticData.level;
    }

    return this.props.level;
  }

  handleClick() {
    let level = this.getPriorityLevel();

    if (level >= this.props.maxLevel) {
      level = 0;
    } else {
      level += 1;
    }

    this.setState({optimisticData: {level}});
    this.props.onChange(this.props.id, level);
  }

  render() {
    let label = null;

    if (this.props.showLabel) {
      label = <span className="priority-meter__label">{this.getPriorityLabel()}</span>;
    }

    return (
      <div className="priority-meter__wrapper" onClick={this.props.clickHandled ? undefined : this.handleClick}>
        <div
          className={
            'priority-meter ' +
            `priority-meter--max-${this.props.maxLevel} ` +
            `priority-meter--level-${this.getPriorityLevel()}`
          }
        />
        {label}
      </div>
    );
  }
}

export type PriorityMeterType = PriorityMeter;
export default injectIntl(PriorityMeter, {forwardRef: true});
