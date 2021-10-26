import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';
import {useKeyPressEvent} from 'react-use';

import {ContextMenu} from '@client/ui';
import UIStore from '@client/stores/UIStore';

import type {ActiveContextMenu} from '@client/stores/UIStore';

interface ContextMenuMountPointProps {
  id: ActiveContextMenu['id'];
}

const ContextMenuMountPoint: FC<ContextMenuMountPointProps> = observer(({id}: ContextMenuMountPointProps) => {
  const isOpen = UIStore.activeContextMenu?.id === id;
  const items = UIStore.activeContextMenu?.items ?? [];
  const triggerCoordinates = UIStore.activeContextMenu?.clickPosition ?? {
    x: 0,
    y: 0,
  };

  const {i18n} = useLingui();

  useKeyPressEvent('Escape', () => UIStore.dismissContextMenu(id));

  return (
    <ContextMenu
      triggerCoordinates={triggerCoordinates}
      onOverlayClick={() => {
        UIStore.dismissContextMenu(id);
      }}
      onOverlayRightClick={(e) => {
        e.preventDefault();
      }}
      isIn={isOpen}
    >
      {items.map((item, index) => {
        let menuItemContent;
        let menuItemClasses;

        switch (item.type) {
          case 'action':
            menuItemClasses = classnames('menu__item', {
              'is-selectable': item.clickHandler,
            });
            menuItemContent = (
              <span>
                <span
                  className={classnames('menu__item__label--primary', {
                    'has-action': item.labelAction,
                  })}
                >
                  <span className="menu__item__label">{i18n._(item.label)}</span>
                  {item.labelAction ? (
                    <span className="menu__item__label__action">
                      <item.labelAction />
                    </span>
                  ) : undefined}
                </span>
                {item.labelSecondary ? (
                  <span className="menu__item__label--secondary">
                    <item.labelSecondary />
                  </span>
                ) : undefined}
              </span>
            );
            break;
          case 'separator':
          default:
            menuItemClasses = classnames('menu__item', {
              'menu__item--separator': item.type === 'separator',
            });
            break;
        }

        return (
          <li className={menuItemClasses} key={item.type === 'action' ? item.action : `sep-${index}`}>
            <button
              type="button"
              disabled={item.type !== 'action' || !item.clickHandler}
              onClick={(event) => {
                if (item.type !== 'separator') {
                  if (item.dismissMenu === false) {
                    event.nativeEvent.stopImmediatePropagation();
                  }

                  if (item.clickHandler) {
                    item.clickHandler(event);
                  }

                  if (item.dismissMenu !== false) {
                    UIStore.dismissContextMenu(id);
                  }
                }

                return false;
              }}
              onContextMenu={(event) => {
                event.preventDefault();
              }}
            >
              {menuItemContent}
            </button>
          </li>
        );
      })}
    </ContextMenu>
  );
});

export default ContextMenuMountPoint;
