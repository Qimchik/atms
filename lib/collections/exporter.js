Meteor.methods({ 
  exportProject: function(projectId, dates) {
    var fields = [
      "Employee Name",
      ""
    ];
    var date = dates.from,
        hoursDates = [],
        id = 0;
    while(date < dates.to) {
      var endOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate()+6);
      hoursDates.push({
        id: id,
        from: date,
        to: endOfWeek
      });
      fields.push(getMonth(date.getMonth()) + ' ' + date.getDate() + ' - ' + getMonth(endOfWeek.getMonth()) + ' ' + endOfWeek.getDate());
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+7);
      id++
    }
 
    var data = [],
        users = [];

    UserAccess.find({projectId: projectId}).forEach(function (access) {
      var userAccessDateFrom = new Date(access.dateFrom.year, access.dateFrom.month, access.dateFrom.date),
          userAccessDateTo = new Date(access.dateTo.year, access.dateTo.month, access.dateTo.date);
      if (dates.from >= userAccessDateFrom && dates.from <= userAccessDateTo || userAccessDateFrom >= dates.from && userAccessDateFrom <= dates.to) {
        var user = Meteor.users.findOne({_id: access.userId});
        users.push({
          userId: access.userId,
          userName: user.firstName + ' ' + user.lastName,
          lastName: user.lastName
        });
      }
    });

    users = _.sortBy(users, 'lastName');

    users.forEach(function (user) {
      var userName = user.userName,
          hours = {
            locked: [],
            norma: [],
            onCall: [],
            overtime: [],
          };
      for (var i = hoursDates.length - 1; i >= 0; i--) {
        hours.locked.push('N');
        hours.norma.push(0);
        hours.onCall.push(0);
        hours.overtime.push(0);
      };
      hoursDates.forEach(function (date) {
        LoggedTime.find({userId: user.userId, projectId: projectId}).forEach(function (time) {
          var timeDate = new Date(time.date.year, time.date.month, time.date.date);
          var dateFrom = {
                year: date.from.getFullYear(),
                month: date.from.getMonth(),
                date: date.from.getDate()
              },
              dateTo = {
                year: date.to.getFullYear(),
                month: date.to.getMonth(),
                date: date.to.getDate()
              }
          if (date.from <= timeDate && date.to >= timeDate) {
            if (Locker.findOne({userId: user.userId, dateFrom: dateFrom, dateTo: dateTo}) && time.hours) {
              hours.locked[date.id] = 'Y';
            }
            if (Tasks.findOne({_id: time.taskId}).isOvertime) {
              hours.overtime[date.id] += parseFloat(time.hours);
            } else if (Tasks.findOne({_id: time.taskId}).title === 'Shifting') {
              hours.onCall[date.id] += parseFloat(time.hours);
            } else {
              hours.norma[date.id] += parseFloat(time.hours);
            }
          }
        });
      });
      hours.norma.forEach(function (hour, i) {
        hours.norma[i] = hour || '';
      });
      hours.overtime.forEach(function (hour, i) {
        hours.overtime[i] = hour || '';
      });
      hours.onCall.forEach(function (hour, i) {
        hours.onCall[i] = hour || '';
      });
      var normaHours = [
            "",
            "Norma Hours"
          ],
          overtimeHours = [
            "",
            "Approved Overtime",
          ],
          locked = [
            userName,
            "Locked"
          ],
          onCall = [
            "",
            "On-Call support"
          ];
      hours.locked.forEach(function (hours) {
        locked.push(hours);
      });
      hours.norma.forEach(function (hours) {
        normaHours.push(hours);
      });
      hours.onCall.forEach(function (hours) {
        onCall.push(hours);
      });
      hours.overtime.forEach(function (hours) {
        overtimeHours.push(hours);
      });

      data.push(locked);
      data.push(normaHours);
      data.push(onCall);
      data.push(overtimeHours);
    });
 
    return {fields: fields, data: data};
  },
  exportPTO: function(dates) {
    var fields = [
      "Employee Name",
      "Pr. Period",
      "Occurred",
      "Taken",
      "End Balance"
    ];

    var gsapps = Projects.findOne({title: 'GSApps'}),
        pto = Tasks.findOne({title: 'PTO'}),
        data = [];

    UserAccess.find({projectId: gsapps._id}).forEach(function (access) {
      var thisUser = Meteor.users.findOne({_id: access.userId}),
          user = [
            thisUser.firstName + ' ' + thisUser.lastName
          ];
      var pto = getPTO(thisUser._id, dates);
      console.log(pto);
      user.push(pto.endOfPrior);
      user.push(pto.duringCurrent);
      user.push(pto.taken);
      user.push(pto.endOfCurrent);
      data.push(user);
    });

    console.log(data);

    return {fields: fields, data: data};
  },
  exportExpenses: function(dates) {
    var fields = [
      "Employee Name",
      "Transportation",
      "Meal",
      "Lodging",
      "Office supply",
      "Entertaiment",
      "Other"
    ];
    var data = [];

    Meteor.users.find().forEach(function (user) {
      var thisUser = [user.firstName + ' ' + user.lastName, 0, 0, 0, 0, 0, 0];
      Expenses.find({userId: user._id}).forEach(function (expenses) {
        var expensesDateFrom = new Date(expenses.dateFrom.year, expenses.dateFrom.month, expenses.dateFrom.date),
            expensesDateTo = new Date(expenses.dateTo.year, expenses.dateTo.month, expenses.dateTo.date);
        if (dates.from >= expensesDateFrom && dates.from <= expensesDateTo || expensesDateFrom >= dates.from && expensesDateFrom <= dates.to) {
          switch(expenses.type) {
            case "transportation":
              thisUser[1] += parseFloat(expenses.cost);
              break;
            case "meal":
              thisUser[2] += parseFloat(expenses.cost);
              break;
            case "lodging":
              thisUser[3] += parseFloat(expenses.cost);
              break;
            case "officeSupply":
              thisUser[4] += parseFloat(expenses.cost);
              break;
            case "entertaiment":
              thisUser[5] += parseFloat(expenses.cost);
              break;
            case "other":
              thisUser[6] += parseFloat(expenses.cost);
              break;
          }
        }
      });
      data.push(thisUser);
    });

    return {fields: fields, data: data};
  }
});