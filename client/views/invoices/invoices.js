Template.invoices.helpers({
  projects: function() {
    var projects = [];
    Projects.find().forEach(function (project) {
      var title = project.title === 'GSApps' ? 'PTO' : project.title
      projects.push({
        _id: project._id,
        title: title
      });
    });
    projects.push({
      _id: 'expenses',
      title: 'Expenses'
    })
    return projects;
  },
  dates: function() {
    var week = thisWeeks(8, 5);
    Session.set('dates', week);
    return datesFormat(week);
  }
});

Template.invoices.events({
  'submit form': function(e) {
    e.preventDefault();

    var submittedData = {
          projectId: $('select').children(":selected").attr("id"),
          dates: {
            from: '',
            to: ''
          }
        },
        from = $('#weeksFrom').find('option:selected').attr('id'),
        to = $('#weeksTo').find('option:selected').attr('id'),
        dates = Session.get('dates');

    dates.forEach(function (date) {
      if (date.id === +from) {
        submittedData.dates.from = date.from;
      }
      if (date.id === +to) {
        submittedData.dates.to = new Date(date.to.getFullYear(), date.to.getMonth(), date.to.getDate());
      }
    });

    if (submittedData.projectId === 'expenses') {
      MyAppExporter.exportExpenses(submittedData.dates);
    } else if (Projects.findOne({_id: submittedData.projectId}).title !== 'GSApps') {
      MyAppExporter.exportProject(submittedData.projectId, submittedData.dates);
    } else if (Projects.findOne({_id: submittedData.projectId}).title === 'GSApps') {
      MyAppExporter.exportPTO(submittedData.dates);
    }
  }
});