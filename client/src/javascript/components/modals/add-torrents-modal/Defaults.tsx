import axios from 'axios';
import ConfigStore from '@client/stores/ConfigStore';

const {baseURI} = ConfigStore;

export var DEFAULT_TAG = '';

// get the default tag on app init... this is kinda hacky,
// ideally we would fetch it when loading the form, but
// changing the defaultValue of the `TagSelect` dynamically
// does not work.
(() => {
  axios.get<AuthVerificationResponse>(`${baseURI}api/auth/verify`, {withCredentials: true}).then(({data}) => {
    console.log('auth: ', data.username, data.basicUsername);
    DEFAULT_TAG =
      data.username && data.username != '_config' ? data.username : data.basicUsername ? data.basicUsername : '';
  });
})();
