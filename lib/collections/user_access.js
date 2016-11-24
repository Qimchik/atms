UserAccess = new Mongo.Collection('userAccess')

Meteor.methods({
	assignProject: function(submittedData) {
		UserAccess.insert(submittedData)
	}
  ,	deassignProject: function(userId, projectId) {
		UserAccess.remove({
			userId: userId
		  , projectId: projectId
		})
	}
})
