import classnames from 'classnames';
import {FC} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import {Lock} from '@client/ui/icons';

interface ToggleListProps {
  className?: string;
  checkboxLabel?: string;
  items: Array<{
    id?: string;
    label: string;
    isLocked?: boolean;
    defaultChecked: boolean;
    onClick?: (checked: boolean) => void;
  }>;
}

const ToggleList: FC<ToggleListProps> = ({className, checkboxLabel, items}: ToggleListProps) => (
  <div css={{width: '100%'}} role="none">
    <ul
      className={classnames('sortable-list', className)}
      css={{
        '.sortable-list__item': {
          cursor: 'default',
        },
      }}
    >
      {items.map((item) => {
        const {id, label, isLocked = false, defaultChecked, onClick} = item;
        return (
          <li
            className={classnames('sortable-list__item', {
              'sortable-list__item--is-locked': isLocked,
            })}
            key={id || label}
          >
            {isLocked ? <Lock /> : null}
            <div className="sortable-list__content sortable-list__content__wrapper">
              <span className="sortable-list__content sortable-list__content--primary">
                <Trans id={label} />
              </span>
              {isLocked ? null : (
                <span className="sortable-list__content sortable-list__content--secondary">
                  <Checkbox
                    defaultChecked={defaultChecked}
                    id={id}
                    onClick={(event) => onClick?.((event.target as HTMLInputElement).checked)}
                  >
                    {checkboxLabel && <Trans id={checkboxLabel} />}
                  </Checkbox>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

ToggleList.defaultProps = {
  className: undefined,
  checkboxLabel: undefined,
};

export default ToggleList;
