enum HttpResponseString {

    /**
     * Server error standard response message.
     */
    INTERNAL_SERVER_ERROR = "Something went wrong.",

    /**
     * Standard response when it's an invalid request.
     * Use custom message for validation error by specifying invalid values.
     */
    BAD_REQUEST = "Invalid request.",

    /**
     * Response for invalid credentail login attempt
     */
    INVALID_CREDENTIALS = "Invalid credentials.",

    /**
     * Response for Unauthorized requests
     */
    UNAUTHORIZED = "Unauthorized request.",

    /**
     * Response for not found requests
     */
    NOT_FOUND = "Not found.",
}

export default HttpResponseString;
