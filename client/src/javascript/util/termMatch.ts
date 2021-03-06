const termMatch = <T>(elements: Array<T>, sub: (element: T) => string, searchString: string): Array<T> => {
  if (searchString !== '') {
    const queries: Array<RegExp> = [];
    const searchTerms = searchString.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i += 1) {
      queries.push(new RegExp(searchTerms[i], 'gi'));
    }

    return elements.filter((element) => {
      for (let i = 0, len = queries.length; i < len; i += 1) {
        if (!sub(element).match(queries[i])) {
          return false;
        }
      }
      return true;
    });
  }

  return elements;
};

export default termMatch;
