const termMatch = <T>(
  elements: Array<T> | undefined | null,
  sub: (element: T) => string,
  searchString: string,
): Array<T> => {
  if (searchString !== '' && elements?.length) {
    const queries: Array<RegExp> = [];
    const searchTerms = searchString.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i += 1) {
      try {
        queries.push(new RegExp(searchTerms[i], 'gi'));
      } catch {
        // do nothing.
      }
    }

    return elements.filter((element) => {
      if (sub(element) === searchString) {
        return true;
      }

      if (queries.every((query) => sub(element).match(query))) {
        return true;
      }

      return false;
    });
  }

  return elements ?? [];
};

export default termMatch;
