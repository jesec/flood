import {FC, ReactNode, useState} from 'react';
import {useIntl} from 'react-intl';

import PriorityLevels from '../../constants/PriorityLevels';

interface PriorityMeterProps {
  id: string | number;
  level: number;
  maxLevel: number;
  priorityType: keyof typeof PriorityLevels;
  showLabel?: boolean;
  clickHandled?: boolean;
  changePriorityFuncRef?: React.MutableRefObject<() => number>;
  onChange: (id: this['id'], level: this['level']) => void;
}

const PriorityMeter: FC<PriorityMeterProps> = ({
  id,
  level,
  maxLevel,
  priorityType,
  showLabel,
  clickHandled,
  changePriorityFuncRef,
  onChange,
}: PriorityMeterProps) => {
  const intl = useIntl();
  const [priorityLevel, setPriorityLevel] = useState<number>(level);

  const changePriority = () => {
    let newLevel = priorityLevel;

    if (newLevel >= maxLevel) {
      newLevel = 0;
    } else {
      newLevel += 1;
    }

    setPriorityLevel(newLevel);
    onChange(id, newLevel);

    return newLevel;
  };

  if (changePriorityFuncRef != null) {
    // eslint-disable-next-line no-param-reassign
    changePriorityFuncRef.current = changePriority;
  }

  let labelElement: ReactNode;
  if (showLabel) {
    const priorityLevels = PriorityLevels[priorityType];

    let priorityLevelElement: ReactNode;
    switch (priorityLevels[priorityLevel as keyof typeof priorityLevels]) {
      case 'DONT_DOWNLOAD':
        priorityLevelElement = intl.formatMessage({
          id: 'priority.dont.download',
        });
        break;
      case 'HIGH':
        priorityLevelElement = intl.formatMessage({
          id: 'priority.high',
        });
        break;
      case 'LOW':
        priorityLevelElement = intl.formatMessage({
          id: 'priority.low',
        });
        break;
      default:
        priorityLevelElement = intl.formatMessage({
          id: 'priority.normal',
        });
        break;
    }

    labelElement = <span className="priority-meter__label">{priorityLevelElement}</span>;
  }

  return (
    <div
      className="priority-meter__wrapper"
      onClick={
        clickHandled
          ? undefined
          : () => {
              changePriority();
            }
      }>
      <div className={`priority-meter priority-meter--max-${maxLevel} priority-meter--level-${priorityLevel}`} />
      {labelElement}
    </div>
  );
};

PriorityMeter.defaultProps = {
  showLabel: false,
  clickHandled: false,
  changePriorityFuncRef: undefined,
};

export default PriorityMeter;
