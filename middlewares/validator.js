import {validationResult} from "express-validator";


const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err)=>(error[err.param]=err.msg));
        return res.status(400).json({error});

    }
    next();
}
export default validator;