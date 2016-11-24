Template.allUsers.helpers({
  users: function() {
    Session.set('ptoDates', getPtoDates());
    var users = [];
    Meteor.users.find({}, {sort: {userName: 1}}).forEach(function (user) {
      users.push({
        _id: user._id,
        userName: user.firstName + ' ' + user.lastName,
        lastName: user.lastName,
        pto: getPto(user._id)
      });
    });
    users = _.sortBy(users, 'userName')
    return users;
  },
  manager: function() {
    if (Meteor.user().profile.isAdmin || Managers.findOne({userId: Meteor.userId()})) {
      return true;
    }
    return false;
  },
  ptoDates: function() {
    var ptoDates = Session.get('ptoDates')
    return ptoDates && ptoDates.map(function(date) {
    	return getMonth(date.getMonth()) + ' ' + date.getDate()
    })
  },
  admin: function() {
    return Meteor.user().profile.isAdmin;
  }
});

Template.projects.helpers({
  projects: function() {
    var projects = [];
    UserAccess.find({userId: this._id}).forEach(function (access) {
      if (Projects.findOne({_id: access.projectId}).title !== 'PTO')
        projects.push(Projects.findOne({_id: access.projectId}).title);
    });
    return projects;
  }
});

function getPto(id) {
  var pto = [];
  Session.get('ptoDates').forEach(function (date) {
    pto.push({
      date: date,
      hours: '-'
    });
  });

  if (!!UserAccess.findOne({userId: id})) {
    var ptoId = Tasks.findOne({title: 'PTO'})._id;
    LoggedTime.find({userId: id, taskId: ptoId}).forEach(function (time, i) {
      pto.forEach(function (ptoItem) {
        var timeDate = new Date(time.date.year, time.date.month, time.date.date);
        if (+ptoItem.date === +timeDate) {
          ptoItem.hours = time.hours;
        }
      });
    });
  }
  return pto;
}

Template.allUsers.events({
  'submit form#pto': function (e) {
    e.preventDefault();

    Meteor.call('pto', $(e.target).closest('td').find('input').val().trim(), this._id, function (error, result) {
      if (error) {
        return throwError(error.reason);
      }
    });
  }
});
