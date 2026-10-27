const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
class NotificationsService {
  list(userId){return {items:NotificationsRepository.listForUser(userId),unread:NotificationsRepository.unreadCount(userId)}}
  unread(userId){return {unread:NotificationsRepository.unreadCount(userId)}}
  markRead(id,userId){return NotificationsRepository.markRead(id,userId)}
  markAllRead(userId){return NotificationsRepository.markAllRead(userId)}
  remove(id,userId){return NotificationsRepository.remove(id,userId)}
}
module.exports = { NotificationsService: new NotificationsService() };