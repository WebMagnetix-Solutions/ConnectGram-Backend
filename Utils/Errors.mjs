export const createError = (res, status, message) => {
    res.status(status).json(
        {
            message: message
        }
    )
}

export const internalServerError = (res) => {
    res.status(500).json(
        {
            message: "Internal server error" 
        }
    )
}