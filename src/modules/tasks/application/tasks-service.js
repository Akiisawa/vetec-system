const { TasksRepository } = require('../../../infrastructure/repositories/mock/tasks-repository');
const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError } = require('../../../shared/domain/errors');
const { isNonEmptyString } = require('../../../shared/validation/validators');
class TasksService {
  list(q, user) { return TasksRepository.list(q, user); }
  get(id){return TasksRepository.findById(id)}
  create(d,actor){
    if(!isNonEmptyString(d.title))throw new ValidationError('Título é obrigatório');
    if(!d.projectId)throw new ValidationError('Projeto é obrigatório');
    const t=TasksRepository.create(d);
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'tasks',resourceId:t.id});
    if(t.assigneeId&&t.assigneeId!==actor)NotificationsRepository.create({userId:t.assigneeId,type:'INFO',title:'Nova tarefa atribuída',message:'Tarefa "'+t.title+'" foi atribuída a você.',link:'tasks'});
    return t;
  }
  update(id,p,actor){
    const t=TasksRepository.update(id,p);
    AuditRepository.log({actorId:actor,action:'UPDATE',resource:'tasks',resourceId:id});
    return t;
  }
  remove(id,actor){const r=TasksRepository.remove(id);AuditRepository.log({actorId:actor,action:'DELETE',resource:'tasks',resourceId:id});return r}
}
module.exports = { TasksService: new TasksService() };