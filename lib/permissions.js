accessToUser = function(userId, doc, fields) {
  var user = Meteor.users.findOne({_id: userId});
  var manager = Managers.findOne({userId: userId});
  if (!!user.profile.isAdmin) {
    return true;
  } else if (!!manager) {
    return !_.contains(fields, 'profile');
  }
  return doc && doc._id === userId && !_.contains(fields, 'profile');
};

isAdmin = function() {
  return !!Meteor.user().profile.isAdmin;
};

isManager = function() {
  return !!Managers.findOne({userId: Meteor.userId()}) || !!Meteor.user().profile.isAdmin;
};

deny = function() {
  return false;
};

Meteor.users.allow({
  update: deny,
  remove: deny
});

Meteor.users.deny({
  update: function(userId, post, fieldNames) {
    return (_.without(fieldNames, 'email', 'skype', 'userName', 'position').length > 0);
  }
});

Locker.allow({
  insert: deny,
  update: deny,
  remove: deny
});

LoggedTime.allow({
  insert: deny,
  update: deny,
  remove: deny
});

Managers.allow({
  insert: deny,
  update: deny,
  remove: deny
});

Projects.allow({
  insert: deny,
  update: function(userId, doc) {
    return !!Meteor.user().profile.isAdmin && doc.title !== 'GSApps';
  },
  remove: deny
});

PTO.allow({
  insert: deny,
  update: deny,
  remove: deny
});

PTOHours.allow({
  insert: deny,
  update: deny,
  remove: deny
});

Tasks.allow({
  insert: deny,
  update: deny,
  remove: deny
});

UserAccess.allow({
  insert: deny,
  update: deny,
  remove: deny
});

Expenses.allow({
  insert: deny,
  update: deny,
  remove: deny
});

HRMS.allow({
  insert: deny,
  update: deny,
  remove: deny
});
