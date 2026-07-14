import Response from "../utils/response.js";

const errorHandler = (err, req, res, next) => {

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

export default errorHandler;