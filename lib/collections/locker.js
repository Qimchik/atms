Locker = new Mongo.Collection('locker');

Meteor.methods({
  lockTime: function(userId, dateFrom, dateTo, managerId) {
    var date = new Date(),
        date = {
          year: date.getFullYear(),
          month: date.getMonth(),
          date: date.getDate()
        };
    var lockerId = Locker.insert({userId: userId, managerId: managerId, dateFrom: dateFrom, dateTo: dateTo, date: date});
    return lockerId;
  },
  unlockTime: function(lockerId) {
    Locker.remove({_id: lockerId});
  }
});