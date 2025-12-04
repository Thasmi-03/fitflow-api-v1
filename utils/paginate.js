export function getPagination(req, defaultLimit = 10, maxLimit = 50) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const requestedLimit = parseInt(req.query.limit, 10) || defaultLimit;
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
