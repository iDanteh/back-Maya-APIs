class Response {

    static success(res, data = null, message = "Operación exitosa", status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = "Error", status = 500, error = null) {
        return res.status(status).json({
            success: false,
            message,
            error
        });
    }

}

export default Response;