const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class EquipmentsRepository {
  list({page=1,pageSize=10,search='',status=''}={}){
    let rows=db.equipments.slice();
    if(status)rows=rows.filter(e=>e.status===status);
    if(search){const q=search.toLowerCase();rows=rows.filter(e=>e.name.toLowerCase().includes(q)||e.code.toLowerCase().includes(q)||e.location.toLowerCase().includes(q))}
    rows.sort((a,b)=>a.id-b.id);
    const total=rows.length,start=(page-1)*pageSize;
    return {items:rows.slice(start,start+pageSize),total,page,pageSize};
  }
  findById(id){const e=db.equipments.find(x=>x.id===id);if(!e)throw new NotFoundError('Equipamento');return e}
  nextCode(){const max=db.equipments.reduce((m,e)=>Math.max(m,Number(e.code.replace(/\D/g,''))||0),0);
    return 'EQ-'+String(max+1).padStart(3,'0')}
  create(data){const now=new Date().toISOString();
    const e={id:nextId('equipments'),code:data.code||this.nextCode(),name:data.name,type:data.type||'',manufacturer:data.manufacturer||'',model:data.model||'',serialNumber:data.serialNumber||'',location:data.location||'',status:data.status||'OPERATIONAL',purchaseDate:data.purchaseDate||null,lastMaintenanceDate:data.lastMaintenanceDate||null,nextMaintenanceDate:data.nextMaintenanceDate||null,notes:data.notes||'',active:true,createdAt:now,updatedAt:now};
    db.equipments.push(e);return e}
  update(id,patch){const e=db.equipments.find(x=>x.id===id);if(!e)throw new NotFoundError('Equipamento');
    Object.assign(e,patch,{updatedAt:new Date().toISOString()});return e}
  remove(id){const i=db.equipments.findIndex(e=>e.id===id);if(i===-1)throw new NotFoundError('Equipamento');
    const [r]=db.equipments.splice(i,1);return r}
}
module.exports = { EquipmentsRepository: new EquipmentsRepository() };