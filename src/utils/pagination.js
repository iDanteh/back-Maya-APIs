export const getPagination = (query) => {
    const limit = Math.min(Math.max(parseInt(query.limit) || 100, 1), 500);
    const page  = Math.max(parseInt(query.page)  || 1, 1);
    const offset = (page - 1) * limit;
    return { limit, offset, page };
};
