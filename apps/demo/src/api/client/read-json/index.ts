// A body that is not JSON is "no body", not an error: the caller decides if it needed one.
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export { readJson };
