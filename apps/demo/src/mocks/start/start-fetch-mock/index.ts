// A dynamic import, like the worker's, so none of this is in the main chunk (ADR-0005, ADR-0018).
async function startFetchMock(): Promise<void> {
  const { fetchNetwork } = await import('../../fetch-network');
  fetchNetwork.enable();
}

export { startFetchMock };
