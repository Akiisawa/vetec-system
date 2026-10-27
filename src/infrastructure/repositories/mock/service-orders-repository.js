const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class ServiceOrdersRepository {
  list({page=1,pageSize=10,search='',status='',priority=''}={}){
    let rows=db.serviceOrders.slice();
    if(status)rows=rows.filter(s=>s.status===status);
    if(priority)rows=rows.filter(s=>s.priority===priority);
    if(search){const q=search.toLowerCase();rows=rows.filter(s=>s.title.toLowerCase().includes(q)||s.code.toLowerCase().includes(q))}
    rows.sort((a,b)=>b.id-a.id);
    const total=rows.length,start=(page-1)*pageSize;
    const items = rows.slice(start,start+pageSize).map(s=>({...s,
      customerName: db.customers.find(c=>c.id===s.customerId)?.name||null,
      equipmentName: db.equipments.find(e=>e.id===s.equipmentId)?.name||null,
      assigneeName: db.users.find(u=>u.id===s.assigneeId)?.name||null
    }));
    return {items,total,page,pageSize};
  }
  findById(id){const s=db.serviceOrders.find(x=>x.id===id);if(!s)throw new NotFoundError('Ordem de Serviço');return s}
  create(data){const now=new Date().toISOString();
    const id=nextId('serviceOrders');
    const s={id,code:'OS-'+String(id).padStart(4,'0'),title:data.title,description:data.description||'',customerId:data.customerId,projectId:data.projectId||null,equipmentId:data.equipmentId||null,assigneeId:data.assigneeId||null,priority:data.priority||'MEDIUM',status:data.status||'OPEN',scheduledDate:data.scheduledDate||null,completedDate:data.completedDate||null,hoursWorked:Number(data.hoursWorked||0),totalCost:Number(data.totalCost||0),notes:data.notes||'',createdAt:now,updatedAt:now};
    db.serviceOrders.push(s);return s}
  update(id,patch){const s=db.serviceOrders.find(x=>x.id===id);if(!s)throw new NotFoundError('Ordem de Serviço');
    if(patch.hoursWorked!==undefined)patch.hoursWorked=Number(patch.hoursWorked);
    if(patch.totalCost!==undefined)patch.totalCost=Number(patch.totalCost);
    if(patch.status==='DONE'&&!s.completedDate)patch.completedDate=new Date().toISOString().slice(0,10);
    Object.assign(s,patch,{updatedAt:new Date().toISOString()});return s}
  remove(id){const i=db.serviceOrders.findIndex(s=>s.id===id);if(i===-1)throw new NotFoundError('Ordem de Serviço');
    const [r]=db.serviceOrders.splice(i,1);return r}
}
module.exports = { ServiceOrdersRepository: new ServiceOrdersRepository() };