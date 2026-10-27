const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class NotificationsRepository {
  listForUser(userId){
    return db.notifications
      .filter(n=>!n.userId||n.userId===userId)
      .sort((a,b)=>b.id-a.id);
  }
  unreadCount(userId){
    return this.listForUser(userId).filter(n=>!n.read).length;
  }
  markRead(id,userId){
    const n=db.notifications.find(x=>x.id===id&&(!x.userId||x.userId===userId));
    if(!n)throw new NotFoundError('Notificação');
    n.read=true;return n;
  }
  markAllRead(userId){
    this.listForUser(userId).forEach(n=>n.read=true);
    return {ok:true};
  }
  create(data){
    const n={id:nextId('notifications'),userId:data.userId||null,type:data.type||'INFO',title:data.title,message:data.message||'',link:data.link||null,read:false,createdAt:new Date().toISOString()};
    db.notifications.push(n);return n;
  }
  remove(id,userId){
    const i=db.notifications.findIndex(x=>x.id===id&&(!x.userId||x.userId===userId));
    if(i===-1)throw new NotFoundError('Notificação');
    const [r]=db.notifications.splice(i,1);return r;
  }
}
module.exports = { NotificationsRepository: new NotificationsRepository() };