PTO = new Mongo.Collection('pto')
PTOHours = new Mongo.Collection('ptoHours')
PTOsold = new Mongo.Collection('ptoSold')

Meteor.methods({
	getPTOSold: function(userId, date ) {
		var PTO = PTOsold.find({ userId: userId }).fetch()[0].hours
		//alert(PTO);
		return PTO
	},
	recalcPTO: function(userId) {
		var ptoId = PTO.findOne({ userId: userId })._id
		PTO.update({ _id: ptoId }, { $set: { coefficients: null }})
		PTOHours.remove({ ptoId: ptoId })
		LoggedTime.find({ userId: userId }).forEach(function(loggedTime) {
			logTime(loggedTime)
		})
  	}
})
