Template.newTaskForProject.events({
	'submit form': function (e) {
		e.preventDefault()

		var submittedData = {
			projectId: this._id
		  , title: $(e.target).find('[name="title"]').val().trim()
		  ,	isOvertime: $(e.target).find('[name="isOvertime"]').prop('checked')
		};

		Meteor.call('newTask', submittedData, function (error, result) {
			if (error) {
				return throwError(error.reason)
			}
			if (result) {
				throwInfo('Task has been created!')
				$(e.target).find('[name="title"]').val('')
				$(e.target).find('[name="title"]').focus()
				$(e.target).find('[name="isOvertime"]').prop('checked', false)
				Router.go('allTasks')
			}
		})
	}
})
