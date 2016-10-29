var util = require('util');

var clientUtil = {
  mapClientResponse: (requestedKeys, clientResponse) => {
    if (clientResponse.length === 0) {
      return [];
    }

    // clientResponse is always an array of arrays.
    if (clientResponse[0].length === 1) {
      // When the length of the nested arrays is 1, the nested arrays represent a
      // singular requested value (e.g. total data transferred or current upload
      // speed). Therefore we construct an object where the requested keys map to
      // their values.
      return clientResponse.reduce((memo, value, index) => {
        memo[requestedKeys[index]] = value[0];

        return memo;
      }, {});
    } else {
      // When the length of the nested arrays is more than 1, the nested arrays
      // represent one of many items of the same type (e.g. a list of torrents,
      // peers, files, etc). Therefore we construct an array of objects, where each
      // object contains all of the requested keys and its value. We add an index
      // for each item, a requirement for file lists.
      return clientResponse.map((listItem, index) => {
        return listItem.reduce((nestedMemo, value, nestedIndex) => {
          nestedMemo[requestedKeys[nestedIndex]] = value;

          return nestedMemo;
        }, {index});
      }, []);
    }
  }
}

module.exports = clientUtil;
