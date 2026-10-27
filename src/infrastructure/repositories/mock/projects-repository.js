const { db, nextId } = require('../../database/mock-db');
const { NotFoundError, ConflictError } = require('../../../shared/domain/errors');
const TRANSITIONS = {
  PLANNING:['IN_PROGRESS','CANCELLED'],
  IN_PROGRESS:['ON_HOLD','COMPLETED','CANCELLED'],
  ON_HOLD:['IN_PROGRESS','CANCELLED'],
  COMPLETED:[], CANCELLED:[]
};
class ProjectsRepository {
  list(query = {}, user = null) {
    let items = [...db.projects];

    // --- RBAC ---
    if (user && user.role === 'MANAGER') {
      items = items.filter(p => p.managerId === user.id);
    } else if (user && user.role === 'TECHNICIAN') {
      const taskRepo = require('./tasks-repository');
      const userTasks = taskRepo.list({ pageSize: 99999 }, { id: user.id, role: 'TECHNICIAN' });
      const projectIds = new Set(userTasks.items.map(t => t.projectId));
      items = items.filter(p => projectIds.has(p.id));
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(p =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.code && p.code.toLowerCase().includes(s)) ||
        (p.customerName && p.customerName.toLowerCase().includes(s))
      );
    }
    if (query.status) items = items.filter(p => p.status === query.status);

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return { items: paged, total, page, pageSize };
  }
  findById(id){const p=db.projects.find(x=>x.id===id);if(!p)throw new NotFoundError('Projeto');return p}
  nextCode(){const max=db.projects.reduce((m,p)=>Math.max(m,Number(p.code.replace(/\D/g,''))||0),0);
    return `PRJ-${String(max+1).padStart(4,'0')}`}
  create(data){const now=new Date().toISOString();
    const p={id:nextId('projects'),code:data.code||this.nextCode(),name:data.name,
      description:data.description||'',customerId:data.customerId,managerId:data.managerId,
      status:data.status||'PLANNING',budget:Number(data.budget||0),
      startDate:data.startDate||null,endDate:data.endDate||null,
      active:true,createdAt:now,updatedAt:now};
    db.projects.push(p);return p}
  update(id,patch){const p=db.projects.find(x=>x.id===id);if(!p)throw new NotFoundError('Projeto');
    if(patch.status&&patch.status!==p.status){
      const ok=TRANSITIONS[p.status]||[];
      if(!ok.includes(patch.status))throw new ConflictError(`Transição inválida: ${p.status} → ${patch.status}`);
    }
    if(patch.budget!==undefined)patch.budget=Number(patch.budget);
    Object.assign(p,patch,{updatedAt:new Date().toISOString()});return p}
  remove(id){const i=db.projects.findIndex(p=>p.id===id);if(i===-1)throw new NotFoundError('Projeto');
    const [r]=db.projects.splice(i,1);return r}
}
module.exports = { ProjectsRepository: new ProjectsRepository(), TRANSITIONS };