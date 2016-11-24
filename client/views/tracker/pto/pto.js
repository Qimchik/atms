Template.pto.helpers({
  FTE: function() {
    return UserAccess.findOne({userId: Meteor.userId(), projectId: Projects.findOne({title: 'GSApps'})._id})
  },
  pto: function() {
    return getPTO(Meteor.userId(), Session.get('currentWeek'));
  }
});