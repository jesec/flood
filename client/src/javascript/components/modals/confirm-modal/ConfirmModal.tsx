import {FC} from 'react';
import {observer} from 'mobx-react';

import Modal from '../Modal';
import UIStore from '../../../stores/UIStore';

const ConfirmModal: FC = observer(() => {
  if (UIStore.activeModal?.id !== 'confirm') {
    return null;
  }

  const {actions, content, heading} = UIStore.activeModal || {};

  return <Modal actions={actions} content={<div className="modal__content">{content}</div>} heading={heading} />;
});

export default ConfirmModal;
