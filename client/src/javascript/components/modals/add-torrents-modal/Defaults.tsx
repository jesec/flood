import axios from 'axios';
import ConfigStore from '@client/stores/ConfigStore';

const {baseURI} = ConfigStore;

// Workaround for missing React 19 use()
function createResource<T>(promise: Promise<T>) {
  let status = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    },
  );

  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw error;
      return result;
    },
  };
}

export const DEFAULT_TAG = createResource(
  axios.get<AuthVerificationResponse>(`${baseURI}api/auth/verify`, {withCredentials: true}).then(({data}) => {
    return data.username && data.username != '_config' ? data.username : data.basicUsername ? data.basicUsername : '';
  }),
);
