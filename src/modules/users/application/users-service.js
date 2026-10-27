const bcrypt = require('bcryptjs');
const { UsersRepository } = require('../../../infrastructure/repositories/mock/users-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError, ConflictError } = require('../../../shared/domain/errors');
const { isEmail, isNonEmptyString } = require('../../../shared/validation/validators');
const ROLES=['ADMIN','MANAGER','TECHNICIAN','VIEWER'];
class UsersService {
  list(q){return UsersRepository.list(q)}
  get(id){return UsersRepository.findById(id)}
  async create(d,actor){
    if(!isNonEmptyString(d.name))throw new ValidationError('Nome é obrigatório');
    if(!isEmail(d.email))throw new ValidationError('E-mail inválido');
    if(!isNonEmptyString(d.password)||d.password.length<8)throw new ValidationError('Senha deve ter ao menos 8 caracteres');
    if(d.role&&!ROLES.includes(d.role))throw new ValidationError('Perfil inválido');
    if(UsersRepository.findByEmail(d.email))throw new ConflictError('E-mail já cadastrado');
    const hash=await bcrypt.hash(d.password,10);
    const c=UsersRepository.create({name:d.name.trim(),email:d.email.toLowerCase().trim(),password:hash,role:d.role||'VIEWER',departmentId:d.departmentId||null});
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'users',resourceId:c.id});
    return c;
  }
  update(id,p,actor){
    if(p.role&&!ROLES.includes(p.role))throw new ValidationError('Perfil inválido');
    if(p.email&&!isEmail(p.email))throw new ValidationError('E-mail inválido');
    const u=UsersRepository.update(id,p);
    AuditRepository.log({actorId:actor,action:'UPDATE',resource:'users',resourceId:id});
    return u;
  }
  remove(id,actor){
    const r=UsersRepository.remove(id);
    AuditRepository.log({actorId:actor,action:'DELETE',resource:'users',resourceId:id});
    return r;
  }
}
module.exports = { UsersService: new UsersService() };