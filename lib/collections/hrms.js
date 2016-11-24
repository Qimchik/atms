HRMS = new Mongo.Collection('hrms')

Meteor.methods({
	setHRMS: function(o) {
		var userId = o.userId
		var hrms = HRMS.findOne({ userId: userId })
		if (hrms) {
			HRMS.update({ _id: hrms._id }, { $set: o })
			Meteor.call('recalcPTO', userId)
			// Meteor.users.find().forEach(function(user) {
			// 	Meteor.call('recalcPTO', user._id)
			// })
		} else {
			HRMS.insert(o)
		}
	}
})
