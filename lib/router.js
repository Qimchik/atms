Router.configure({
  layoutTemplate: 'basic',
  loadingTemplate: 'loading',
  waitOn: function() { return [Meteor.subscribe('user', Meteor.userId()), Meteor.subscribe('expenses')];}
});

Router.map(function() {
  this.route('tracker', {
    path: '/',
    waitOn: function() {
      return [
        Meteor.subscribe('tasks'),
        Meteor.subscribe('projects'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('userLoggedTime'),
        Meteor.subscribe('locker'),
        Meteor.subscribe('checked'),
        Meteor.subscribe('pto'),
        Meteor.subscribe('ptoHours'),
        Meteor.subscribe('expenses')
      ]
    }
  });

  this.route('editProfile', {
    path: '/editProfile'
  });

  this.route('locker', {
    path: '/locker',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('projects'),
        Meteor.subscribe('tasks'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('loggedTime'),
        Meteor.subscribe('locker'),
        Meteor.subscribe('checked'),
        Meteor.subscribe('expenses'),
        Meteor.subscribe('pto'),
        Meteor.subscribe('ptoHours')
      ]
    }
  });

  this.route('invoices', {
    path: '/invoices',
    waitOn: function() {
      return Meteor.subscribe('projects');
    }
  });

  this.route('allProjects', {
    path: '/projects',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('users'),
        Meteor.subscribe('managers')
      ]
    }
  });

  this.route('newProject', {
    path: '/projects/new',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('users'),
        Meteor.subscribe('managers')
      ]
    }
  });

  this.route('editProject', {
    path: '/projects/:_id/edit',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('users')
      ]
    },
    data: function() {
      return Projects.findOne(this.params._id);
    }
  });

  this.route('allUsers', {
    path: '/users',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('projects'),
        Meteor.subscribe('tasks'),
        Meteor.subscribe('loggedTime'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('pto')
      ]
    }
  });

  this.route('viewUserProfile', {
    path: '/users/:_id/view',
    waitOn: function() {
      return [
        Meteor.subscribe('users')
      ]
    },
    data: function() {
      return Meteor.users.findOne({_id: this.params._id});
    }
  });

  this.route('editUserProfile', {
    path: '/users/:_id/editProfile',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('projects')
      ]
    },
    data: function() {
      return Meteor.users.findOne({_id: this.params._id});
    }
  });

  this.route('editUserProjects', {
    path: '/users/:_id/editUserProjects',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('projects')
      ]
    },
    data: function() {
      return Meteor.users.findOne({_id: this.params._id});
    }
  });

  this.route('employmentHistory', {
    path: '/users/:_id/employmentHistory',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('pto'),
        Meteor.subscribe('projects'),
        Meteor.subscribe('tasks'),
        Meteor.subscribe('ptoHours'),
        Meteor.subscribe('loggedTime'),
        Meteor.subscribe('hrms')
      ]
    },
    data: function() {
      return Meteor.users.findOne({_id: this.params._id});
    }
  });

  this.route('allTasks', {
    path: '/tasks',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('tasks')
      ]
    }
  });

  this.route('newTaskForProject', {
    path: '/:_id/newTasks',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('userAccess'),
        Meteor.subscribe('tasks')
      ]
    },
    data: function() {
      return Projects.findOne({_id: this.params._id});
    }
  })

  this.route('editTask', {
    path: '/tasks/:_id/editTask',
    waitOn: function() {
      return [
        Meteor.subscribe('projects'),
        Meteor.subscribe('managers'),
        Meteor.subscribe('tasks')
      ]
    },
    data: function() {
      return Tasks.findOne({_id: this.params._id});
    }
  });

  this.route('singup', {
    path: '/iedGFSdQwN9Ru2MUr7h.zmERO/singup'
  });
});

var requireLogin = function() {
  if (!Meteor.user()) {
    this.render('accessDenied');
  } else {
    this.next();
  }
}

var requireAdmin = function() {
  if (!Meteor.user()) {
    this.render('accessDenied');
  } else {
    if (!Meteor.user().profile.isAdmin) {
      this.render('accessDenied');
    } else {
      this.next();
    }
  }
}

var requireManager = function() {
  if (!Meteor.user()) {
    this.render('accessDenied');
  } else {
    if (!!Meteor.user().profile.isAdmin || !!Managers.findOne({userId: Meteor.userId()}) ) {
      this.next();
    } else {
      this.render('accessDenied');
    }
  }
}

Router.onBeforeAction(function() { clearNotifications();this.next() });
Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {only: ['tracker', 'editProfile', 'viewUserProfile', 'allUsers']});
Router.onBeforeAction(requireAdmin, {only: ['allProjects', 'newProject', 'editProject', 'employmentHistory']});
Router.onBeforeAction(requireManager, {only: ['editUserProfile', 'editUserProjects', 'allTasks', 'editTask', 'newTaskForProject', 'locker', 'invoices']});
