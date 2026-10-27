const { ForbiddenError } = require('../../shared/domain/errors');
const PERMISSIONS = {
  ADMIN: ['*'],
  MANAGER: ['users:read','customers:read','customers:write','projects:read','projects:write','dashboard:read','audit:read',
            'equipments:read','equipments:write','tasks:read','tasks:write','service-orders:read','service-orders:write','notifications:read','notifications:write'],
  TECHNICIAN: ['customers:read','projects:read','projects:write','dashboard:read',
               'equipments:read','tasks:read','tasks:write','service-orders:read','service-orders:write','notifications:read','notifications:write'],
  VIEWER: ['customers:read','projects:read','dashboard:read','equipments:read','tasks:read','service-orders:read','notifications:read']
};
function hasPermission(role,resource,action){
  const p=PERMISSIONS[role]||[];
  if(p.includes('*'))return true;
  return p.includes(`${resource}:${action}`);
}
function requirePermission(resource,action){
  return (req,res,next)=>{
    if(!req.user)return next(new ForbiddenError());
    if(!hasPermission(req.user.role,resource,action))
      return next(new ForbiddenError(`Permissão negada: ${resource}:${action}`));
    next();
  };
}
module.exports = { PERMISSIONS, hasPermission, requirePermission };