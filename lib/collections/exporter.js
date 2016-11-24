Meteor.methods({ 
  exportProject: function(projectId, dates) {
    var fields = [
      "Employee Name",
      "Hours Type"
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
          //  locked: [],
            norma: [],
            PTO: [],
            shifting: [],
            overtime: [],
            holiday: [],
            total: []
          };
      for (var i = hoursDates.length - 1; i >= 0; i--) {
        //hours.locked.push('N');
        hours.norma.push(0);
        hours.PTO.push(getPTO(user.userId,hoursDates[hoursDates.length-i-1]).taken);
        //hours.PTO.push(0);
        hours.overtime.push(0);
        hours.holiday.push(0);
        hours.shifting.push(0);
        hours.total.push(getPTO(user.userId,hoursDates[hoursDates.length-i-1]).taken);
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

            //PTOTaken = getPTO(user.userId,date).taken;
            //hours.PTO.push(PTOTaken);
            //hours.PTO.push(getPTO(user.userId,date).taken);
            hours.total[date.id]+= parseFloat(time.hours);
            //hours.total[date.id]+= PTOTaken;

            /*if (Locker.findOne({userId: user.userId, dateFrom: dateFrom, dateTo: dateTo}) && time.hours) {
              hours.locked[date.id] = 'Y';
            }*/
            
            if (Tasks.findOne({_id: time.taskId}).isOvertime) {
              hours.overtime[date.id] += parseFloat(time.hours);
            } else if (Tasks.findOne({_id: time.taskId}).title === 'Shifting') {
              hours.shifting[date.id] += parseFloat(time.hours);
            } else if (Tasks.findOne({_id: time.taskId}).title === 'Holiday') {
              hours.holiday[date.id] += parseFloat(time.hours);
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
      hours.shifting.forEach(function (hour, i) {
        hours.shifting[i] = hour || '';
      });
      hours.PTO.forEach(function (hour, i) {
        hours.PTO[i] = hour || '';
      });
      var locked = [
            userName
          ],
          holidayHours = [
            "",
            "Holiday"
          ],
          PTO = [
            "",
            "PTO"
          ],
          shiftingHours = [
            "",
            "Shifting hours"
          ], 
          overtimeHours = [
            "",
            "Overtime",
          ],
          normaHours = [
            "",
            "Working Hours"
          ],
          totalHours = [
            "",
            "Total (sum all above for each column)"
          ];
      /*hours.locked.forEach(function (hours) {
        locked.push(hours);
      });*/
      hours.norma.forEach(function (hours) {
        normaHours.push(hours);
      });
      hours.PTO.forEach(function (hours) {
        PTO.push(hours);
      });
      hours.overtime.forEach(function (hours) {
        overtimeHours.push(hours);
      });
      hours.total.forEach(function (hours) {
        totalHours.push(hours);
      });
      hours.shifting.forEach(function (hours) {
        shiftingHours.push(hours);
      });

      data.push(locked);
      data.push(holidayHours);
      data.push(PTO);
      //data.push(shiftingHours);
      data.push(overtimeHours);
      data.push(normaHours);
      data.push(totalHours);
    });
 
    return {fields: fields, data: data};
  },
  exportPTO: function(dates) {
    var fields = [
      "Employee Name",
      "Start week",
      "End week",
      "PTO at the beginning of the start week",
      "PTO occurred during period",
      "PTO spent during period",
      "PPTO sold during period",
      "PTO by the end of the period"
    ];
//console.log(dates.from.getMonth());
    var gsapps = Projects.findOne({title: 'GSApps'}),
        pto = Tasks.findOne({title: 'PTO'}),duringCurrent,
        data = [];
////
/*PTOHours.find({ptoId: PTO.findOne({userId: userId})._id}).forEach(function (hours) {
      var hoursDate = new Date(hours.date.year, hours.date.month, hours.date.date),
          ptoHours = parseFloat(hours.hours);
      if (hoursDate < date.from) {
        pto.endOfPrior += ptoHours;
      }
      if (hoursDate >= date.from && hoursDate <= date.to) {
        if (ptoHours > 0) {
          duringCurrent += ptoHours;
        }
      }
    });
alert(duringCurrent);*/

///
    UserAccess.find({projectId: gsapps._id}).forEach(function (access) {
      var thisUser = Meteor.users.findOne({_id: access.userId}),
          user = [
            thisUser.firstName + ' ' + thisUser.lastName
          ];

     // var endOfFirstWeek = new Date(dates.from.getFullYear(), dates.from.getMonth(), dates.from.getDate()+6);
      //var beginOfSecondWeek = new Date(dates.to.getFullYear(), dates.to.getMonth(), dates.to.getDate()-6);
      var pto = getPTO(thisUser._id, dates);
      user.push(getMonth(dates.from.getMonth()) + ' ' + dates.from.getDate() );
        //getMonth(dates.endOfFirstWeek.getMonth()) + ' ' + dates.endOfFirstWeek.getDate() );
      user.push(getMonth(dates.to.getMonth()) + ' ' + dates.to.getDate() );
      //  getMonth(dates.to.getMonth()) + ' ' + dates.to.getDate());
      user.push(pto.endOfPrior);
      user.push(pto.duringCurrent);
      user.push(pto.taken);
      user.push(pto.sold);
      user.push(pto.endOfCurrent);
      data.push(user);
    });

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