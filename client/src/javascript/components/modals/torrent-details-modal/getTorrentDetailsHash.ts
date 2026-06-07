import UIStore from '@client/stores/UIStore';

const getTorrentDetailsHash = (): string | null => {
  const {activeModal} = UIStore;

  if (activeModal?.id === 'torrent-details') {
    return activeModal.hash;
  }

  return UIStore.detailsPanelHash;
};

export default getTorrentDetailsHash;
