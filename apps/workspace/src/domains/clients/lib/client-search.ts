export function matchesClientSearch(
  client: { name: string; contact: string; assetInterest: string; budget: string },
  search: string,
) {
  const q = search.trim().toLowerCase();
  return (
    !q ||
    [client.name, client.contact, client.assetInterest, client.budget].some((value) =>
      value.toLowerCase().includes(q),
    )
  );
}
