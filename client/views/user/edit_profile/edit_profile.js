Template.editProfile.rendered = function () {
  setTimeout(function(){
      $('input[name="password"]').attr("type","password");
  },100);
};

Template.editProfile.helpers({
  user: function() {
    return Meteor.user();
  },
  email: function() {
    return Meteor.user().emails[0].address;
  },
  dateOfBirth: function() {
    return Meteor.user().dateOfBirth;
  },
  image: function() {
    return Meteor.user().image;
  },
  imageWasUploaded: function() {
    return {
      finished: function(i, fileInfo) {
        var removeAvatar = false;
        if (Meteor.users.findOne({_id: Meteor.userId()}).image) {
          removeAvatar = true;
          var url = Meteor.users.findOne({_id: Meteor.userId()}).image;
        }
        Meteor.call('setImage', Meteor.userId(), fileInfo.url, function(error, result) {
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

Template.editProfile.events({
  'submit form': function(e) {
    e.preventDefault();

    var userId = Meteor.userId(),
        submittedData = profileData(e),
        password = $('[name="password"]').val().trim();

    if (password !== '') {
      if (password.length < 6) {
        return throwError('Password should be more than 6 symbols.');
      } else {
        Meteor.call('setPassword', userId, password, function (error, result) {
          if (error)
            throwError(error.reason);
          Meteor.loginWithPassword(Meteor.users.findOne({_id: userId}).emails[0].address, password);
        });
      }
    }

    if (submittedData.email && submittedData.firstName && submittedData.lastName) {
      Meteor.call('editProfile', userId, submittedData, function (error, result) {
        if (error)
          return throwError(error.reason);
        throwInfo('Your profile has been changed successful!');
      });
    } else {
      throwError('Please fill all fields');
    }
  }
});