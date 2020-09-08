import {createBrowserHistory} from 'history';

import stringUtil from '@shared/util/stringUtil';
import ConfigStore from '../stores/ConfigStore';

const history = createBrowserHistory({basename: stringUtil.withoutTrailingSlash(ConfigStore.getBaseURI())});

export default history;
