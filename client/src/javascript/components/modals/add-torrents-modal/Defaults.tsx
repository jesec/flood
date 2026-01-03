import axios from 'axios';
import ConfigStore from '@client/stores/ConfigStore';

const {baseURI} = ConfigStore;

export const DEFAULT_TAG = axios
  .get<AuthVerificationResponse>(`${baseURI}api/auth/verify`, {withCredentials: true})
  .then(({data}) => {
    return data.username && data.username != '_config' ? data.username : data.basicUsername ? data.basicUsername : '';
  });
