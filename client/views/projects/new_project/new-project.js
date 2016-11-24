Template.newProject.helpers({
  users: function () {
    var users = [];
    Meteor.users.find().forEach(function (user) {
      users.push({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      });
    });;
    users = _.sortBy(users, 'lastName');
    return users;
  }
});

Template.newProject.events({
  'submit form': function (e) {
    e.preventDefault();

    var managers = [],
        isSame = false;
    $(e.target).find('.manager').each(function() {
      var data = $(this).val().trim();
      if (managers.length) {
        managers.forEach(function (manager, i) {
          if (manager === data) {
            isSame = true;
            return;
          } else if (i === 0) {
            managers.push(data);
          }
        });
      } else {
        managers.push(data);
      }
    });

    var submittedData = {
      projectTitle: $(e.target).find('[name="title"]').val().trim(),
      managers: managers
    };

    if (!isSame)
      Meteor.call('newProject', submittedData, function (error, result) {
        if (error) {
          return throwError(error.reason);
        }
        throwInfo('Project has been created!');
        Router.go('allProjects');
      });
    else {
      return throwError('There a few same managers.');
    }
  },
  'click button#plus': function(e) {
    buttonPlus(e);
  },
  'click button#minus': function(e) {
    buttonMinus(e);
  }
});