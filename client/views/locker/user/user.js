Template.user.helpers({
  locked: function() {
    var currentWeek = Session.get('currentWeek'),
        user = this;
    var date = {
          from: {
            year: currentWeek.from.getFullYear(),
            month: currentWeek.from.getMonth(),
            date: currentWeek.from.getDate()
          },
          to: {
            year: currentWeek.to.getFullYear(),
            month: currentWeek.to.getMonth(),
            date: currentWeek.to.getDate()
          }
        };
    Session.set('lockerDate', date);
    if (Locker.findOne({userId: user._id, dateFrom: date.from, dateTo: date.to})) {
      return true;
    }
    return false;
  },
  userName: function() {
    return this.firstName + ' ' + this.lastName;
  },
  checked: function() {
    var user = this,
        date = Session.get('lockerDate');

    if (Checked.findOne({userId: user._id, dateFrom: date.from, dateTo: date.to})) {
      return true;
    }
    return false;
  },
  weekDates: function() {
    return getWeekDates();
  }
});