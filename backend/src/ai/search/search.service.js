export const getLiveSearchContext = async ({
  mode,
  query,
}) => {
  const lowerQuery = query.toLowerCase();

  const needsLiveSearch =
    lowerQuery.includes('latest') ||
    lowerQuery.includes('today') ||
    lowerQuery.includes('current') ||
    lowerQuery.includes('news');

  if (!needsLiveSearch) {
    return '';
  }

  return `
Live Search Context:
Real-time search APIs are not connected yet.
Inform the user that live internet search needs to be enabled.
`;
};