Template.allProjects.helpers({
	projects: function () {
		var projects = []
		Projects.find().forEach(function (project) {
			if (project.title !== 'GSApps') {
				projects.push(project)
			}
		})
		return projects
	}
})

Template.project.helpers({
	managers: function() {
		var managers = []
		Managers.find({ projectId: this._id }).forEach(function(manager) {
			var user = Meteor.users.findOne({ _id: manager.userId })
			managers.push(user.firstName + ' ' + user.lastName)
		})
		return managers
	}
})
