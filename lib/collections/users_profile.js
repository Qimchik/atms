Meteor.methods({
  resetUserPassword: function(user) {
    Accounts.setPassword(user, 'password');
  },
  editUserProfile: function(userId, submittedData) {
    Meteor.users.update({_id: userId}, {$set: {firstName: submittedData.firstName, lastName: submittedData.lastName, 
      skype: submittedData.skype, nickname: submittedData.nickname, dateOfBirth: submittedData.dateOfBirth, 
      mobPhone: submittedData.mobPhone, emergencyPhone: submittedData.emergencyPhone, address: submittedData.address}});
  },
  getDates: function() {
    var dateFrom = new Date(),
        dateTo = new Date(dateFrom.getFullYear()+1, dateFrom.getMonth(), dateFrom.getDate()-1);
    return {dateFrom: getUTCDate(dateFrom), dateTo: getUTCDate(dateTo)};
  }
});

