const { ProjectsRepository } = require('../../../infrastructure/repositories/mock/projects-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError } = require('../../../shared/domain/errors');
const { isNonEmptyString, isPositiveNumber } = require('../../../shared/validation/validators');
class ProjectsService {
  list(q, user) { return ProjectsRepository.list(q, user); }
  get(id){return ProjectsRepository.findById(id)}
  create(d,actor){
    if(!isNonEmptyString(d.name))throw new ValidationError('Nome é obrigatório');
    if(!d.customerId)throw new ValidationError('Cliente é obrigatório');
    if(d.budget!==undefined&&!isPositiveNumber(Number(d.budget)))throw new ValidationError('Orçamento inválido');
    const p=ProjectsRepository.create(d);
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'projects',resourceId:p.id});
    return p;
  }
  update(id,p,actor){
    const r=ProjectsRepository.update(id,p);
    AuditRepository.log({actorId:actor,action:'UPDATE',resource:'projects',resourceId:id});
    return r;
  }
  remove(id,actor){
    const r=ProjectsRepository.remove(id);
    AuditRepository.log({actorId:actor,action:'DELETE',resource:'projects',resourceId:id});
    return r;
  }
}
module.exports = { ProjectsService: new ProjectsService() };