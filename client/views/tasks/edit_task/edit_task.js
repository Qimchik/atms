Template.editTask.events({
	'submit form': function (e) {
		e.preventDefault()
		var id = this._id
		var task = Tasks.findOne({ _id: id })
		var submittedData = {
			title: $(e.target).find('[name="title"]').val().trim()
		  ,	isOvertime: $(e.target).find('[name="isOvertime"]').prop('checked')
		}
		Meteor.call('editTask', submittedData, id, function (error, result) {
			if (error) return throwError(error.reason)
			throwInfo('Task has been updated')
			Router.go('allTasks')
		})
	}

  , 'click button#delete': function(e) {
		e.preventDefault()
		Meteor.call('removeTask', this._id)
  		Router.go('allTasks')
	}
})
