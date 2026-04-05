function asyncHandler(fn){
    try {
        return function (req,res,next){
            Promise.resolve(fn(req,res,next)).catch(err => next(err));
        }
    } catch (error) {
        next(error);
    }
}
export {asyncHandler};