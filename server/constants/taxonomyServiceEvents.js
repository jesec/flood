import objectUtil from '../../shared/util/objectUtil';

const taxonomyServiceEvents = ['TAXONOMY_DIFF_CHANGE'];

export default objectUtil.createSymbolMapFromArray(taxonomyServiceEvents);
