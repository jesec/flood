// TODO: Split up this garbage.
export function sortTorrents(torrentsHash, sortBy) {
  let torrents = Object.keys(torrentsHash).map((hash) => {
    return {hash, ...torrentsHash[hash]};
  });

  if (torrents.length) {
    let direction = sortBy.direction;
    let property = sortBy.property;

    torrents.sort((a, b) => {
      let valA = a[property];
      let valB = b[property];

      if (property === 'eta') {
        // keep infinity at bottom of array when sorting by eta
        if (valA === 'Infinity' && valB !== 'Infinity') {
          return 1;
        } else if (valA !== 'Infinity' && valB === 'Infinity') {
          return -1;
        }
        // if it's not infinity, compare the second as numbers
        if (valA !== 'Infinity') {
          valA = Number(valA.cumSeconds);
        }
        if (valB !== 'Infinity') {
          valB = Number(valB.cumSeconds);
        }
      } else if (property === 'name') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (property === 'tags') {
        // TODO: Find a better way to sort tags.
        valA = valA.join(',').toLowerCase();
        valB = valB.join(',').toLowerCase();
      } else {
        valA = Number(valA);
        valB = Number(valB);
      }

      // TODO: Use locale compare for sorting strings.
      if (direction === 'asc') {
        if (valA > valB) {
          return 1;
        }
        if (valA < valB) {
          return -1;
        }
      } else {
        if (valA > valB) {
          return -1;
        }
        if (valA < valB) {
          return 1;
        }
      }

      return 0;
    });

    return torrents;
  } else {
    return torrents;
  }
}
