const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
const TRANSITIONS = { TODO:['IN_PROGRESS','BLOCKED','DONE'], IN_PROGRESS:['TODO','BLOCKED','DONE'], BLOCKED:['TODO','IN_PROGRESS'], DONE:[] };
class TasksRepository {
  list(query = {}, user = null) {
    let items = [...db.tasks];

    // --- RBAC ---
    if (user && user.role === 'MANAGER') {
      const projectRepo = require('./projects-repository');
      const managed = projectRepo.list({ pageSize: 99999 }, { id: user.id, role: 'MANAGER' });
      const managedIds = new Set(managed.items.map(p => p.id));
      items = items.filter(t => managedIds.has(t.projectId));
    } else if (user && user.role === 'TECHNICIAN') {
      items = items.filter(t => t.assigneeId === user.id);
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(t =>
        (t.title && t.title.toLowerCase().includes(s)) ||
        (t.description && t.description.toLowerCase().includes(s))
      );
    }
    if (query.status) items = items.filter(t => t.status === query.status);
    if (query.priority) items = items.filter(t => t.priority === query.priority);
    if (query.projectId) items = items.filter(t => t.projectId === Number(query.projectId));

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return { items: paged, total, page, pageSize };
  }
  findById(id){const t=db.tasks.find(x=>x.id===id);if(!t)throw new NotFoundError('Tarefa');return t}
  create(data){const now=new Date().toISOString();
    const t={id:nextId('tasks'),projectId:data.projectId,title:data.title,description:data.description||'',assigneeId:data.assigneeId||null,priority:data.priority||'MEDIUM',status:data.status||'TODO',dueDate:data.dueDate||null,estimatedHours:Number(data.estimatedHours||0),actualHours:Number(data.actualHours||0),notes:data.notes||'',active:true,createdAt:now,updatedAt:now};
    db.tasks.push(t);return t}
  update(id,patch){const t=db.tasks.find(x=>x.id===id);if(!t)throw new NotFoundError('Tarefa');
    if(patch.status&&patch.status!==t.status){const ok=TRANSITIONS[t.status]||[];if(!ok.includes(patch.status))throw new Error(`Transição inválida: ${t.status} → ${patch.status}`);}
    if(patch.estimatedHours!==undefined)patch.estimatedHours=Number(patch.estimatedHours);
    if(patch.actualHours!==undefined)patch.actualHours=Number(patch.actualHours);
    Object.assign(t,patch,{updatedAt:new Date().toISOString()});return t}
  remove(id){const i=db.tasks.findIndex(t=>t.id===id);if(i===-1)throw new NotFoundError('Tarefa');
    const [r]=db.tasks.splice(i,1);return r}
}
module.exports = { TasksRepository: new TasksRepository() };