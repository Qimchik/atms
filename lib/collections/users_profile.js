Meteor.methods({
  resetUserPassword: function(user) {
    Accounts.setPassword(user, 'password');
  },
  editUserProfile: function(userId, submittedData) {
    Meteor.users.update({_id: userId}, {$set: {emails: [{address: submittedData.email, verified: true}], skype: submittedData.skype, 
      firstName: submittedData.firstName, lastName: submittedData.lastName, position: submittedData.position}});
  },
  getDates: function() {
    var dateFrom = new Date(),
        dateTo = new Date(dateFrom.getFullYear()+1, dateFrom.getMonth(), dateFrom.getDate()-1);
    return {dateFrom: getUTCDate(dateFrom), dateTo: getUTCDate(dateTo)};
  }
});