Tasks = new Mongo.Collection('tasks')

Meteor.methods({
	newTask: function(submittedData) {
		if (submittedData.projectId && submittedData.title) {
			Tasks.insert(submittedData)
			return true
		}
		return false
	}

  ,	editTask: function(submittedData, id) {
		Tasks.update({ _id: id }, {
			$set: {
				title: submittedData.title
			  , isOvertime: submittedData.isOvertime
			}
		})
	}

  ,	removeTask: function(id) {
  		LoggedTime.remove({ taskId: id })
  		PTOHours.remove({ taskId: id })
		Tasks.remove({ _id: id })
	}
})
