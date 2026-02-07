const enforcePrerequisites = async (): Promise<void> => {
  // Ensures that WebAssembly support is present
  if (typeof WebAssembly === 'undefined') {
    throw new Error('WebAssembly is not supported in this environment!');
  }
};

export default enforcePrerequisites;
