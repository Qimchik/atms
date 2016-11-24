Template.editUserProjects.rendered = function() {
	setTimeout(function() {
		$('input[name="dateFrom"]').datepicker({
			todayBtn: "linked",
			format: "M d, yyyy",
			orientation: "top right"
		});
		$('input[name="dateTo"]').datepicker({
			todayBtn: "linked",
			format: "M d, yyyy",
			orientation: "top right"
		});
	}, 300);
}

Template.editUserProjects.helpers({
	userName: function() {
		var user = Meteor.users.findOne({_id: this._id});
		return user.firstName + ' ' + user.lastName;
	},
	userAccesses: function () {
		var userAccesses = [];
		UserAccess.find({userId: this._id}).forEach(function (access) {
			if (Projects.findOne({_id: access.projectId}).title !== 'PTO') {
				var accessDateFrom = new Date(access.dateFrom.year, access.dateFrom.month, access.dateFrom.date),
						accessDateTo = new Date(access.dateTo.year, access.dateTo.month, access.dateTo.date);
				var dateFrom = dateFormat(accessDateFrom),
						dateTo = dateFormat(accessDateTo);
				userAccesses.push({
					title: Projects.findOne({_id: access.projectId}).title,
					dateRange: '(' + dateFrom + ' - ' + dateTo + ')'
				});
			}
		});
		if (userAccesses.length === 0) {
			userAccesses.push({
				title: 'There are no assigned projects.',
				dateRange: ''
			})
		}
		return userAccesses;
	},
	projects: function() {
		var userId = this._id
		var manager = Managers.find({ userId: Meteor.userId() })
		var projects = []
		var dateFrom = dateFormat(new Date())
		var dateTo = dateFormat(new Date(3000, 0, 1))
		if (!Meteor.user().profile.isAdmin) {
			//get manager projects
			manager.forEach(function (project) {
				var managerProject = Projects.findOne({_id: project.projectId}, {_id: 1, title: 1}),
						assigned = false;
				if (UserAccess.findOne({userId: userId, projectId: project.projectId})) {
					assigned = true;
				}
				if (userId !== Meteor.userId())
					projects.push({
						id: managerProject['_id'],
						title: managerProject['title'],
						assigned: assigned,
						dateFrom: dateFrom,
						dateTo: dateTo
					});
			});
		} else {
			Projects.find().forEach(function (project) {
				var GSApps = project.title === 'zzzGSApps',
						assigned = false;
				if (UserAccess.findOne({userId: userId, projectId: project._id})) {
					assigned = true;
				}
				// if (!Managers.findOne({userId: userId, projectId: project._id}))
					projects.push({
						id: project._id,
						title: project.title,
						assigned: assigned,
						GSApps: GSApps,
						dateFrom: dateFrom,
						dateTo: dateTo
					})
			});
		}
		return projects;
	}
});

Template.editUserProjects.events({
	'click button.assign': function(e) {
		e.preventDefault()

		var submittedData = {
			userId: $('h1').attr('id'),
			projectId: $(e.target).attr('id')
		}
		var title = Projects.findOne({_id: submittedData.projectId}).title;
		var dateFrom = $(e.target).closest('td').find('input[name="dateFrom"]').data('datepicker').getDate()
		var dateTo = $(e.target).closest('td').find('input[name="dateTo"]').data('datepicker').getDate()
		submittedData.dateFrom = {
			year: dateFrom.getFullYear(),
			month: dateFrom.getMonth(),
			date: dateFrom.getDate()
		}
		submittedData.dateTo = {
			year: dateTo.getFullYear(),
			month: dateTo.getMonth(),
			date: dateTo.getDate()
		}

		if (UserAccess.findOne({userId: submittedData.userId, projectId: submittedData.projectId})) {
			return throwError('Already assigned')
		}
		if (!submittedData.dateFrom && !submittedData.dateTo) {
			return throwError('Please specify timespan')
		}
		Meteor.call('assignProject', submittedData, title, function(error, result) {
			if (error) return throwError(error.reason)
			throwInfo('Project successfuly assigned')
		})
	},
	'click button.deassign': function(e) {
		e.preventDefault();

		var userId = $('h1').attr('id'),
				projectId = $(e.target).attr('id'),
				isProject = false;

		UserAccess.find({userId: userId}).forEach(function (access) {
			if (!isProject)
				isProject = access.projectId === projectId ? true : false
		});

		if (UserAccess.findOne({userId: userId}) === undefined || !projectId)
			return throwError('User hasn\'t been assigned on this project');

		Meteor.call('deassignProject', userId, projectId, function(error, result) {
			if (error)
				return throwError(error.reason);
			throwInfo('Project succesfuly deassigned!');
		})

		setTimeout(function() {
			$('input[name="dateFrom"]').datepicker({
				todayBtn: "linked",
				format: "M d, yyyy",
				orientation: "top right"
			});
			$('input[name="dateTo"]').datepicker({
				todayBtn: "linked",
				format: "M d, yyyy",
				orientation: "top right"
			});
		}, 300);
	}
});
