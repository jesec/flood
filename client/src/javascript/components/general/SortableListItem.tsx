import classnames from 'classnames';
import {CSS} from '@dnd-kit/utilities';
import {FC, ReactNode} from 'react';
import {useSortable} from '@dnd-kit/sortable';

import {Lock} from '@client/ui/icons';

interface SortableListItemProps {
  children?: ReactNode;
  id: string;
  disabled?: boolean;
}

const SortableListItem: FC<SortableListItemProps> = (props: SortableListItemProps) => {
  const {children, id, disabled} = props;
  const {attributes, setNodeRef, listeners, transform, transition, isDragging} = useSortable({id, disabled});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={classnames('sortable-list__item', {
        'sortable-list__item--is-dragging': isDragging,
        'sortable-list__item--is-locked': disabled,
      })}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {disabled ? <Lock /> : null}
      {children}
    </div>
  );
};

export default SortableListItem;
