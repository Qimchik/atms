Projects = new Mongo.Collection('projects')

Meteor.methods({
	newProject: function(submittedData) {
		if (submittedData.projectTitle && submittedData.managers) {
			var projectId = Projects.insert({ title: submittedData.projectTitle })
			submittedData.managers.forEach(function(manager) {
				Managers.insert({ userId: manager, projectId: projectId })
				var date = new Date()
				UserAccess.insert({
					userId: manager
				  , projectId: projectId
				  , dateFrom: { year: 2000, month: 0, date: 1 }
				  ,	dateTo: { year: 3000, month: 0, date: 1 }
				})
			})
		}
	}

  , editProject: function(submittedData, currentProjectId) {
		var currentProject = Projects.findOne({ _id: currentProjectId })

		var managers = []
		submittedData.managers.forEach(function (manager) {
			managers.push(manager)
		})

		var isManagers = true
		Managers.find({ projectId: currentProjectId }).forEach(function(manager) {
			managers.forEach(function(manager) {
				if (manager !== manager.userId) {
					isManagers = false
				}
			})
		})

		if (submittedData.projectTitle && submittedData.managers) {
			Projects.update({ _id: currentProjectId }
			  , { $set: { title: submittedData.projectTitle }}
			  , function(error, result) {
					if (!error) {
						var managersIdsDates = []
						Managers.find({ projectId: currentProjectId }).forEach(function(manager) {
							managersIdsDates.push({
								managerId: manager.userId
							  ,	date: UserAccess.findOne({
							  		userId: manager.userId
							  	  , projectId: currentProjectId
							  	}).dateFrom
							})
							UserAccess.remove({
								userId: manager.userId
							  , projectId: currentProjectId
							})
							Managers.remove({
								userId: manager.userId
							  , projectId: currentProjectId
							})
						});
						managers.forEach(function (manager) {
							Managers.insert({
								userId: manager
							  , projectId: currentProjectId
							})
							var date = new Date()
							var isWas = false
							var managerAccessDate
							managersIdsDates.forEach(function(managerIdDate) {
								if (manager === managerIdDate.managerId) {
									isWas = true
									managerAccessDate = managerIdDate.date
								}
							})
							if (isWas) {
								UserAccess.insert({
									userId: manager
								  , projectId: currentProjectId
								  , dateFrom: managerAccessDate
								  ,	dateTo: { year: 3000, month: 0, date: 1 }
								})
							} else {
								UserAccess.insert({
									userId: manager
								  , projectId: currentProjectId
								  , dateFrom: { year: date.getFullYear(), month: date.getMonth(), date: date.getDate() }
								  ,	dateTo: { year: 3000, month: 0, date: 1 }
								})
							}
						})
					}
				}
			)
		}
	}

  ,	removeProject: function(id) {
  		LoggedTime.remove({ projectId: id })
  		PTOHours.remove({ projectId: id })
  		Managers.remove({ projectId: id })
  		UserAccess.remove({ projectId: id })
		Tasks.remove({ projectId: id })
		Projects.remove({ _id: id })
	}
})
