Template.header.helpers({
  manager: function() {
    Meteor.subscribe('managers');
    return !!Managers.findOne({userId: Meteor.userId()}) || !!Meteor.user() && !!Meteor.user().profile.isAdmin;
  },
  user: function() {
    var user = Meteor.user();
    return user.firstName + ' ' + user.lastName || Meteor.user().emails[0].address
  }
});

Template.header.events({
  'keypress #login-dropdown-list input': function(e) {
    if (e.keyCode === 13) {
      login();
    }
  },
  'click button#login-submit': function(e) {
    e.preventDefault();

    login();
  },
  'click button#login-logout': function(e) {
    e.preventDefault;

    Meteor.logout();
  },
  'click #login-edit-profile': function(e) {
    e.preventDefault();
    $('#login-dropdown-list').removeClass('open');

    Router.go('editProfile');
  }
});

function login() {
  var submittedData = {
    email: $('#login-email').val().trim(),
    password: $('#login-password').val().trim()
  };

  if (submittedData.email && submittedData.password) {
    Meteor.loginWithPassword(submittedData.email, submittedData.password, function(error) {
      if (error) {
        return throwError('Please check your email and password.');
      }
    });
  }
}