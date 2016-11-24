Template.allTasks.helpers({
  projects: function () {
    return getUserProjects();
  }
});

Template.thisProject.helpers({
  tasks: function() {
    var tasks = [];
    Tasks.find({projectId: this._id}).forEach(function (task) {
      if (task.title !== 'PTO')
        tasks.push({
          _id: task._id,
          title: task.title,
          isOvertime: task.isOvertime
        })
    });
    return tasks;
  }
});