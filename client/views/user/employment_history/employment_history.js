Template.employmentHistory.rendered = function () {
  $(function() {
    $('input[name="hireDate"]').datepicker({
      todayBtn: "linked",
      format: "M d, yyyy",
      orientation: "bottom right"
    });
  });
};

Template.employmentHistory.helpers({
  user: function() {
    var user = {},
        thisUser = Meteor.users.findOne({_id: this._id}),
        thisUserHRMS = HRMS.findOne({userId: thisUser._id});
    user.userName = thisUser.userName;
    if (thisUserHRMS) {
      user.hireDate = dateFormat(new Date(thisUserHRMS.hireDate.year, thisUserHRMS.hireDate.month, thisUserHRMS.hireDate.date));
    }
    return user;
  },
  resumeWasUploaded: function() {
    return {
      finished: function(i, fileInfo) {
        var removeAvatar = false;
        if (Meteor.users.findOne({_id: Meteor.userId()}).resume) {
          removeAvatar = true;
          var url = Meteor.users.findOne({_id: Meteor.userId()}).resume;
        }
        Meteor.call('setResume', Meteor.userId(), fileInfo.url, function(error, result) {
          if (error) {
            return throwError(error.reason);
          }
          if (removeAvatar) {
            Meteor.call('removeResume', url, function (error, result) {
              if (error) {
                return throwError(error.reason);
              }
            });
          }
        });
      }
    }
  },
  isNotHRMS: function() {
    return !HRMS.findOne({userId: this._id});
  }
});

Template.employmentHistory.events({
  'submit form': function (e) {
    e.preventDefault();

    var hireDate = $('input[name="hireDate"]').data('datepicker').getDate(),
        chanegDate = hireDate;

    var submittedData = {
      userId: this._id,
      hireDate: {
        year: hireDate.getFullYear(),
        month: hireDate.getMonth(),
        date: hireDate.getDate()
      },
      ptoAllowance: 20,
      daysPlus: 1,
      daysTill: 5
    };

    Meteor.call('setHRMS', submittedData, this._id, function (error, result) {
      if(error) {
        return throwError(error.reason);
      }
      throwInfo('Employment history has been succesfully edited.');
      Router.go('allUsers');
    });

  }
});
