export function getLinkPath(id) {
  const basePath = "https://consumer.fda.gov.tw/Food/SpecialFoodDetail.aspx";
  const queryParams = new URLSearchParams({
    id: id,
    nodeID: 163,
  });

  return `${basePath}?${queryParams.toString()}`;
}