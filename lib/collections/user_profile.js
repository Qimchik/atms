Meteor.methods({
  editProfile: function(userId, submittedData) {
    Meteor.users.update({_id: userId}, {$set: {firstName: submittedData.firstName, lastName: submittedData.lastName, skype: submittedData.skype, nickname: submittedData.nickname, dateOfBirth: submittedData.dateOfBirth, mobPhone: submittedData.mobPhone, emergencyPhone: submittedData.emergencyPhone, address: submittedData.address}});
    Meteor.users.update({_id: userId}, {$set: {emails: [{address: submittedData.email}]}});
  },
  singup: function(submittedData) {
    var userId = Accounts.createUser({
      email: submittedData.email,
      password: submittedData.password,
      position: 'PTE',
      profile: {
        isAdmin: false
      }
    });
    if (userId) {
      Meteor.users.update({_id: userId}, {$set: {skype: submittedData.skype, firstName: submittedData.firstName, lastName: submittedData.lastName, dateOfBirth: submittedData.dateOfBirth, nickname: submittedData.nickname, mobPhone: submittedData.mobPhone, emergencyPhone: submittedData.emergencyPhone, address: submittedData.address}});
    }
    return userId;
  },
  setImage: function(id, url) {
    Meteor.users.update({_id: id}, {$set: {image: url}});
  },
  image: function() {
    return Meteor.user().image;
  },
  setPassword: function(user, password) {
    Accounts.setPassword(user, password);
  }
});