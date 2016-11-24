LoggedTime = new Mongo.Collection('loggedTime');

Meteor.methods({
	logTime: function(o) {
		if (!isNumeric(o.hours) || o.hours > 24) return
		var userId = o.userId || Meteor.userId()
		if (!hasAccess({ userId: userId, projectId: o.projectId, date: o.date })) {
			return throwError('Access denied')
		}
		if (isLocked({ userId: userId, date: o.date })) {
			return throwError('Locked')
		}
		logTime(o)
		logPto(o)
	}
  , getProjects: function() {
		var projects = [],
				date = getUTCDate(new Date());
		UserAccess.find({userId: this.userId}).forEach(function (access) {
			if (access.dateFrom <= date && date <= access.dateTo) {
				var project = Projects.findOne({_id: access.projectId});
				projects.push({
					_id: project._id,
					title: project.title
				});
			}
		});
		return projects;
	}/*,
		logSold: function(o) {
		if (!isNumeric(o.hours)) return
		PTOsold.remove({ userId: o.userId, currdate: o.date })
		PTOsold.insert({ userId: o.userId, currdate: o.date, hours: o.hours })
	}*/
});
