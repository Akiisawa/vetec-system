const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
const pub = (u) => { const { passwordHash, ...r } = u; return r; };
class UsersRepository {
  list({page=1,pageSize=10,search=''}={}){
    let rows=db.users.slice();
    if(search){const q=search.toLowerCase();rows=rows.filter(u=>u.name.toLowerCase().includes(q)||u.email.includes(q))}
    rows.sort((a,b)=>a.id-b.id);
    const total=rows.length,start=(page-1)*pageSize;
    return {items:rows.slice(start,start+pageSize).map(pub),total,page,pageSize};
  }
  findById(id){const u=db.users.find(x=>x.id===id);if(!u)throw new NotFoundError('Usuário');return pub(u)}
  findByEmail(email){return db.users.find(u=>u.email===String(email).toLowerCase())}
  create({name,email,password,role,departmentId}){
    const now=new Date().toISOString();
    const u={id:nextId('users'),name,email:String(email).toLowerCase(),passwordHash:password,
      role:role||'VIEWER',departmentId:departmentId||null,active:true,createdAt:now,updatedAt:now};
    db.users.push(u); return pub(u);
  }
  update(id,patch){const u=db.users.find(x=>x.id===id);if(!u)throw new NotFoundError('Usuário');
    Object.assign(u,patch,{updatedAt:new Date().toISOString()});return pub(u)}
  remove(id){const i=db.users.findIndex(u=>u.id===id);if(i===-1)throw new NotFoundError('Usuário');
    const [r]=db.users.splice(i,1);return pub(r)}
}
module.exports = { UsersRepository: new UsersRepository() };