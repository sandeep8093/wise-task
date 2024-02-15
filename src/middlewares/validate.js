const Joi = require('joi');

const signUp = (req,res,next) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        password: Joi.string()
          .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$'))
          .message('Password must be at least 8 characters long and include at least one letter and one number')
          .required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(new RegExp('^\\d{10}$')).message('Phone number must be 10 digits').required()
      });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next(); 
};

const login = (req,res,next) => {
    const schema = Joi.object({
        password: Joi.string()
          .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$'))
          .message('Password must be at least 8 characters long and include at least one letter and one number')
          .required(),
        email: Joi.string().email().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next(); 
};



module.exports = {
    signUp,
    login   
}
