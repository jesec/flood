import {createBrowserHistory} from 'history';

import ConfigStore from '@client/stores/ConfigStore';

import stringUtil from '@shared/util/stringUtil';

const history = createBrowserHistory({
  basename: stringUtil.withoutTrailingSlash(ConfigStore.baseURI),
});

export default history;
