class apiResponse {
    constructor(statusCode = 200,data,message = "success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}

export {apiResponse}