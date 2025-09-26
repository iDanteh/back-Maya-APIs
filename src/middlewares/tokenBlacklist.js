export const tokenBlacklist = new Set();

export const invalidateToken = (token) => {
    tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
