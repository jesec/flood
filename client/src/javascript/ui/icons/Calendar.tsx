import classnames from 'classnames';
import {FC, memo} from 'react';

interface CalendarProps {
  className?: string;
}

const Calendar: FC<CalendarProps> = memo(({className}: CalendarProps) => (
  <svg className={classnames('icon', 'icon--calendar', className)} viewBox="0 0 60 60">
    <path d="M48,9.39V1.15H36V9.39H24.1V1.15h-12V9.39H4V58.85H56V9.39ZM40,5.29h4v7.28H40Zm-23.93,0h4v7.28h-4Zm33.38,48H9.9V16.91H49.5Z" />
  </svg>
));

Calendar.defaultProps = {
  className: undefined,
};

export default Calendar;
