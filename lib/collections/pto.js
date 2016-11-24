PTO = new Mongo.Collection('pto')
PTOHours = new Mongo.Collection('ptoHours')
// PTOCount = new Mongo.Collection('ptoCount')

Meteor.methods({
	recalcPTO: function(userId) {
		var ptoId = PTO.findOne({ userId: userId })._id
		PTO.update({ _id: ptoId }, { $set: { coefficients: null }})
		PTOHours.remove({ ptoId: ptoId })
		LoggedTime.find({ userId: userId }).forEach(function(loggedTime) {
			logTime(loggedTime)
		})
  	}
})
