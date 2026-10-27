const jwt = require('jsonwebtoken');
const config = require('../../config');
const { UnauthorizedError } = require('../../shared/domain/errors');
function sign(payload){return jwt.sign(payload,config.jwtSecret,{expiresIn:config.jwtExpiresIn})}
function verify(token){try{return jwt.verify(token,config.jwtSecret)}catch(e){throw new UnauthorizedError('Token inválido ou expirado')}}
module.exports = { sign, verify };