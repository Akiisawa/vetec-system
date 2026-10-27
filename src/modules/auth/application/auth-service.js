const bcrypt = require('bcryptjs');
const { UsersRepository } = require('../../../infrastructure/repositories/mock/users-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { sign } = require('../../../infrastructure/auth/jwt');
const { UnauthorizedError, ValidationError } = require('../../../shared/domain/errors');
class AuthService {
  async login({email,password}){
    if(!email||!password)throw new ValidationError('Informe e-mail e senha');
    const u=UsersRepository.findByEmail(email);
    if(!u||!u.active)throw new UnauthorizedError('Credenciais inválidas');
    const ok=await bcrypt.compare(password,u.passwordHash);
    if(!ok)throw new UnauthorizedError('Credenciais inválidas');
    const token=sign({sub:u.id,role:u.role,name:u.name,email:u.email});
    AuditRepository.log({actorId:u.id,action:'LOGIN',resource:'auth',resourceId:u.id});
    return {token,user:{id:u.id,name:u.name,email:u.email,role:u.role,departmentId:u.departmentId}};
  }
  me(id){return UsersRepository.findById(id)}
}
module.exports = { AuthService: new AuthService() };