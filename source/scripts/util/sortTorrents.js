export function sortTorrents(torrents, sortBy) {
  if (torrents.length) {
    let direction = sortBy.direction;
    let property = sortBy.property;
    let sortedTorrents = Object.assign([], torrents);

    sortedTorrents.sort(function(a, b) {
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
          valA = Number(valA.seconds);
        }
        if (valB !== 'Infinity') {
          valB = Number(valB.seconds);
        }
      } else if (property === 'name') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else {
        valA = Number(valA);
        valB = Number(valB);
      }

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

    return sortedTorrents;
  } else {
    return torrents;
  }
}
