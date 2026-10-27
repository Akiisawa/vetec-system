const { verify } = require('../../infrastructure/auth/jwt');
const { UnauthorizedError } = require('../../shared/domain/errors');
function authenticate(req,res,next){
  const h=req.headers.authorization||'';
  const [,token]=h.split(' ');
  if(!token)return next(new UnauthorizedError());
  try{
    const p=verify(token);
    req.user={id:p.sub,role:p.role,name:p.name,email:p.email};
    next();
  }catch(e){next(e)}
}
module.exports = { authenticate };