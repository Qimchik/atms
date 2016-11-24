Template.singup.rendered = function () {
  setTimeout(function(){
      $('input[name="password"]').attr("type","password");
      $('input[name="confirmPassword"]').attr("type","password");
  },100);
};

Template.singup.events({
  'submit form': function (e) {
    e.preventDefault();

    $('input[name="password"]').attr("type","text");
    $('input[name="confirmPassword"]').attr("type","text");
    var submittedData = profileData(e);

    if (submittedData.email && submittedData.firstName && submittedData.lastName && submittedData.password) {
      if (submittedData.password === submittedData.confirmPassword) {
        Meteor.call('singup', submittedData, function (error, result) {
          if (error) {
            return throwError(error.reason);
            $('input[name="password"]').attr("type","password");
            $('input[name="confirmPassword"]').attr("type","password");
          }
          if (result !== undefined) {
            $(e.target).find('input').val('');
            Meteor.loginWithPassword(submittedData.email, submittedData.password);
            Router.go('/');
          }
        });
      } else {
        throwError('Check your password.');
      }
    } else {
      throwError('Fill all fields, please.');
    }
    $('input[name="password"]').attr("type","password");
    $('input[name="confirmPassword"]').attr("type","password");
  }
});