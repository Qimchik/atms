Template.locker.helpers({
  dates: function() {
    var returnedDate = getDates();
    var dates = Session.get('dates');
    dates.forEach(function (date) {
      if (date.isCurrent) {
        Session.set('currentWeek', date);
      }
    });
    return returnedDate;
  },
  clearUsers: function() {
    Session.set('search', false);
    Session.set('users', null);
  },
  users: function() {
    var currentWeek = Session.get('currentWeek'),
        projects = getUserProjects(),
        projectsId = [],
        accessesId = [],
        usersId = [],
        users = [];
    function isWeekInAccess(accessDateFrom, accessDateTo) {
      return currentWeek.from >= accessDateFrom && currentWeek.from <= accessDateTo || accessDateFrom >= currentWeek.from && accessDateFrom <= currentWeek.to;
    }
    function getWeekDates() {
      var weekDates = [];
      var currentWeek = Session.get('currentWeek');

      while (currentWeek.from <= currentWeek.to) {
        weekDates.push({
          day: getDay(currentWeek.from.getDay()),
          date: getMonth(currentWeek.from.getMonth()) + ' ' + currentWeek.from.getDate()
        })
        currentWeek.from = new Date(currentWeek.from.getFullYear(), currentWeek.from.getMonth(), currentWeek.from.getDate()+1);
      }

      Session.set('weekDates', weekDates);

      return weekDates;
    }


    projects.forEach(function (project) {
      projectsId.push(project._id);
    });

    Session.set('date', currentWeek);
    Session.set('projectsId', projectsId);

    var userAccess = UserAccess.find();

    projectsId.forEach(function (projectId) {
      userAccess.forEach(function (access) {
        if (access.projectId === projectId) {
          var accessDateFrom = new Date(access.dateFrom.year, access.dateFrom.month, access.dateFrom.date),
              accessDateTo = new Date(access.dateTo.year, access.dateTo.month, access.dateTo.date)
          if (isWeekInAccess(accessDateFrom, accessDateTo)) {
            usersId.push(access.userId);
          }
        }
      });
    });

    usersId = _.uniq(usersId);

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
    var locked = [],
        checked = Checked.find({dateFrom: date.from, dateTo: date.to}),
        accesses = UserAccess.find(),
        expenses = Expenses.find({dateFrom: date.from, dateTo: date.to}),
        projects = Projects.find(),
        loggedTime = [],
        dbUsers = Meteor.users.find(),
        weekDates = getWeekDates();

    LoggedTime.find().forEach(function (time) {
      var timeDate = new Date(time.date.year, time.date.month, time.date.date);
      if (currentWeek.from <= timeDate && currentWeek.to >= timeDate) {
        loggedTime.push(time);
      }
    });

    Locker.find().forEach(function (dbLocked) {
      var lockedDateFrom = new Date(dbLocked.dateFrom.year, dbLocked.dateFrom.month, dbLocked.dateFrom.date),
          lockedDateTo = new Date(dbLocked.dateTo.year, dbLocked.dateTo.month, dbLocked.dateTo.date)
          dateTo = new Date(currentWeek.to.getFullYear(), currentWeek.to.getMonth(), currentWeek.to.getDate());
      if (lockedDateFrom <= currentWeek.from && lockedDateTo >= dateTo) {
        locked.push(dbLocked.userId);
      }
    });

    var i = 0;

    usersId.forEach(function (userId) {
      var user = {},
          isLocked = false;

      locked.forEach(function (locked) {
        if (locked === userId) {
          isLocked = true;
        }
      });

      var dbUser;
      dbUsers.forEach(function (user) {
        if (user._id === userId) {
          dbUser = user;
        }
      });

      if (dbUser) {
        user = {
          index: i,
          userId: userId,
          userName: dbUser.firstName + ' ' + dbUser.lastName,
          lastName: dbUser.lastName,
          locked: isLocked,
          weekDates: weekDates,
          checked: '',
          tasks: []
        };

        checked.forEach(function (checked) {
          if (checked.userId === userId) {
            user.checked = 'disabled';
          }
        });

        var total = 0,
            overtime = 0,
            regular = 0,
            pto = 0,
            position = {},
            j = 0,
            k = 0;

        accesses.forEach(function (access) {
          if (access.userId === userId) {
            var accessDateFrom = new Date(access.dateFrom.year, access.dateFrom.month, access.dateFrom.date),
                accessDateTo = new Date(access.dateTo.year, access.dateTo.month, access.dateTo.date);
            if (isWeekInAccess(accessDateFrom, accessDateTo)) {
              var thisProject;
              projects.forEach(function (project) {
                if (access.projectId === project._id) {
                  thisProject = project;
                }
              });
              var tasks = getTasks(thisProject, userId, currentWeek, true, loggedTime);
              user.tasks.push(tasks);
              if (!_.isEmpty(user) && user.tasks) {
                tasks.forEach(function (time) {
                  if (time.title === 'PTO') {
                    position.project = j;
                    position.task = k;
                  }
                  time.hours.forEach(function (hours) {
                    if (hours.hours !== '') {
                      var hours = parseFloat(hours.hours);
                      total += hours;
                      if (time.isOvertime) {
                        overtime += hours;
                      } else if (!time.notPTO) {
                        pto += hours;
                      } else regular += hours;
                    }
                  });
                  k++;
                });

                if (isNumeric(position.task)) {
                  var ptoTask = tasks.splice(position.task, 1);
                  tasks.push(ptoTask[0]);
                }
              }
              j++;
            }
          }
        });

        user.total = total;
        user.regular = regular;
        user.overtime = overtime;
        user.pto = pto;

        if (!_.isEmpty(user)) {
          var expensesTotal = 0;
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
          expenses.forEach(function (expense) {
            if (expense.userId === userId) {
              expensesTotal += parseFloat(expense.cost);
            }
          });
          user.expenses = expensesTotal;
          user.fullPTO = getPTO(userId, currentWeek);
          users.push(user);
        }
        i++;
      }
    });

    users = _.sortBy(users, 'lastName');
    return users;
  }
});

Template.locker.events({
  'change #weeks': function() {
    getWeeks();
  },
  'click button.lock': function(e) {
    e.preventDefault();
    var date = Session.get('date');

    var projectId = Session.get('projectId'),
        dateFrom = {
          year: date.from.getFullYear(),
          month: date.from.getMonth(),
          date: date.from.getDate()
        },
        dateTo = {
          year: date.to.getFullYear(),
          month: date.to.getMonth(),
          date: date.to.getDate()
        },
        userId = this.userId,
        total = this.total,
        managerId = Meteor.userId();

    Meteor.call('lockTime', userId, dateFrom, dateTo, managerId, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click button.unlock': function(e) {
    e.preventDefault;
    var date = Session.get('date');

    var dateFrom = {
          year: date.from.getFullYear(),
          month: date.from.getMonth(),
          date: date.from.getDate()
        },
        dateTo = {
          year: date.to.getFullYear(),
          month: date.to.getMonth(),
          date: date.to.getDate()
        },
        userId = this.userId,
        lockerId;

    Locker.find({userId: userId}).forEach(function (locker) {
      var lockerDateFrom = new Date(locker.dateFrom.year, locker.dateFrom.month, locker.dateFrom.date),
          lockerDateTo = new Date(locker.dateTo.year, locker.dateTo.month, locker.dateTo.date),
          dateTo = new Date(date.to.getFullYear(), date.to.getMonth(), date.to.getDate());
      if (lockerDateFrom >= date.from && lockerDateTo <= dateTo) {
        return lockerId = locker._id;
      }
    });

    Meteor.call('unlockTime', lockerId, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});
