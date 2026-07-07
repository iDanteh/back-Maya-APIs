const Response = require("../utils/response");

module.exports = (err, req, res, next) => {

    const status = err.statusCode || 500;

    return Response.error(
        res,
        err.message,
        status,
        {
            code: err.code || "INTERNAL_ERROR"
        }
    );

};