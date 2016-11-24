Template.editProject.helpers({
	managers: function() {
		var managers = []
		Managers.find({ projectId: this._id }).forEach(function(manager, i) {
			var dbUser = Meteor.users.findOne({ _id: manager.userId })
			managers.push({
				id: manager.userId
			  , name: dbUser.firstName + ' ' + dbUser.lastName
			  ,	lastName: dbUser.lastName
			  ,	isFirst: false
			})
		})
		managers = _.sortBy(managers, 'lastName')
		if (managers[0]) managers[0].isFirst = true
		Session.set('managers', managers)
		return managers
	}

  ,	project: function() {
  		var project = Projects.findOne(this._id)
		return project && project.title
	}
})

Template.users.helpers({
	users: function() {
		var users = []
		var managers = Session.get('managers')
		Meteor.users.find().forEach(function(user) {
			var isManager = false
			managers.forEach(function(manager) {
				if (!isManager) {
					isManager = manager.id === user._id
				}
			})
			if (!isManager) {
				users.push({
					id: user._id
				  ,	name: user.firstName + ' ' + user.lastName
				  ,	lastName: user.lastName
				})
			}
		})
		users = _.sortBy(users, 'lastName')
		return users
	}
})

Template.editProject.events({
	'submit form': function(e) {
		e.preventDefault()

		var currentProjectId = this._id
		var managers = []
		var isSame = false

		$(e.target).find('.manager').each(function() {
			var data = $(this).val().trim()
			if (managers.length) {
				managers.forEach(function (manager, i) {
					if (manager === data) {
						isSame = true
						return
					} else if (i === 0) {
						managers.push(data)
					}
				})
			} else {
				managers.push(data)
			}
		});

		var submittedData = {
			projectTitle: $(e.target).find('[name="title"]').val().trim()
		  ,	managers: managers
		}

		if (!isSame) {
			Meteor.call('editProject', submittedData, currentProjectId, function(error, result) {
				if (error) return throwError(error.reason)
				throwInfo('Project has been updated')
				return Router.go('allProjects')
			})
		} else {
			return throwError('There are duplicate managers')
		}
	}

  , 'click button#delete': function(e) {
		e.preventDefault()
  		Meteor.call('removeProject', this._id)
  		Router.go('allProjects')
	}

  , 'click button#plus': function(e) {
		buttonPlus(e)
	}

  ,	'click button#minus': function(e) {
		var managerId = buttonMinus(e)
		var managers = []

		Session.get('managers').forEach(function (manager) {
			if (manager.id !== managerId) {
				managers.push(manager)
			}
		})
		Session.set('managers', managers)
	}
})
