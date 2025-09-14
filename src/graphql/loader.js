/**
 * Dynamically loads a GraphQL query module.
 * @param {string} queryName The name of the query file (without extension).
 * @returns {Promise<string>} A promise that resolves to the query string.
 */
export async function loadQuery(queryName) {
  try {
    const module = await import(`./queries/${queryName}.js`);
    // Assuming each query file exports a constant named in uppercase letters followed by _QUERY
    const queryKey = Object.keys(module).find(key => key.endsWith('_QUERY'));
    if (!queryKey) {
      throw new Error(`No query export found in ${queryName}.js`);
    }
    return module[queryKey];
  } catch (error) {
    console.error(`Error loading query ${queryName}:`, error);
    throw error;
  }
}
