Template.editUserProfile.helpers({
  email: function () {
    return Meteor.users.findOne({_id: this._id}).emails[0].address;
  },
  dateOfBirth: function() {
    return Meteor.users.findOne({_id: this._id}).dateOfBirth;
  },
  imageWasUploaded: function() {
    var self = this;
    return {
      finished: function(i, fileInfo) {
        var removeAvatar = false;
        if (Meteor.users.findOne({_id: self._id}).image) {
          removeAvatar = true;
          var url = Meteor.users.findOne({_id: self._id}).image;
        }
        Meteor.call('setImage', self._id, fileInfo.url, function(error, result) {
          if (error) {
            return throwError(error.reason);
          }
          if (removeAvatar) {
            Meteor.call('removeAvatar', url, function (error, result) {
              if (error) {
                return throwError(error.reason);
              }
            });
          }
        });
      }
    }
   }
});

Template.editUserProfile.events({
  'submit form': function(e) {
    e.preventDefault();

    var userId = this._id;

    var submittedData = profileData(e);

    if (submittedData.email && submittedData.firstName && submittedData.lastName) {  
      Meteor.call('editUserProfile', userId, submittedData, function (error, result) {
        if (error)
          return throwError(error.reason);
        throwInfo('User data has been changed successful!');
        Router.go('allUsers');
      });
    } else {
      throwError('Please fill all fields');
    }
  },
  'click button#resetPassword': function(e) {
    e.preventDefault();

    var userId = this._id

    Meteor.call('resetUserPassword', userId, function(error, result) {
      if (error)
        throwError(error.reason);
      
      throwInfo('Password has been reset successful!');
      Router.go('allUsers');
    });
  },
  'click .avatar': function(e) {
    e.preventDefault();

    $('.imageUpload').show();
  }
});