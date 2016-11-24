gsappsProjectId = function() {
	return Projects.findOne({ title: 'GSApps' })._id
}

ptoTaskId = function() {
	return Tasks.findOne({ projectId: gsappsProjectId(), title: 'PTO' })._id
}

expandDate = function(d) {
	return {
		year: d.getFullYear()
	  , month: d.getMonth()
	  , date: d.getDate()
	}
}

compactDate = function(d) {
	return new Date(d.year, d.month, d.date)
}

weekStart = function(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() + 1)
}

isLocked = function(o) {
	return !!Locker.findOne({
		userId: o.userId
	  , dateFrom: expandDate(weekStart(compactDate(o.date)))
	})
}

hasAccess = function(o) {
	var access = UserAccess.findOne({
		userId: o.userId
	  , projectId: o.projectId
	})
	if (!access) return false
	var date = compactDate(o.date)
	var from = compactDate(access.dateFrom)
	var till = compactDate(access.dateTo)
	return date >= from && date <= till
}

logTime = function(o) {
	LoggedTime.remove({ userId: o.userId, taskId: o.taskId, date: o.date })
	LoggedTime.insert(o)
	logPto(o)
}

logPto = function(o) {
	var userId = o.userId
	var pto = PTO.findOne({ userId: userId })
	var coefficient = pto.coefficients && pto.coefficients.find(function(x) {
		return x.year == o.date.year
	})
	if (coefficient) {
		coefficient = coefficient.coefficient
	} else {
		var date = expandDate(new Date())
		var ptoAllowance
		var hrms = HRMS.findOne({ userId: userId })
		if (hrms) {
			var daysPlus = (date.year - hrms.hireDate.year) * hrms.daysPlus
			ptoAllowance = hrms.ptoAllowance + Math.min(daysPlus, hrms.daysTill)
		} else {
			HRMS.insert({
				userId: userId
			  , hireDate: date
			  , ptoAllowance: 20
			  , daysTill: 5
			  , daysPlus: 1
			})
			ptoAllowance = 20
		}

		// var ptoCount = PTOCount.findOne({ year: o.date.year }) || { count: 11 }
		var workingDays = 365 - 104 - ptoAllowance // - ptoCount.count
		coefficient = ptoAllowance / workingDays

		var coefficients = pto.coefficients || []
		coefficients.push({
			year: o.date.year
		  , coefficient: coefficient
		})
		PTO.update({ _id: pto._id }, {
			$set: {
				coefficients: coefficients
			}
		})
	}

	PTOHours.remove({
		ptoId: pto._id
	  , taskId: o.taskId
	  , date: o.date
	})

	if (o.taskId === ptoTaskId()) coefficient = -1
	PTOHours.insert({
		ptoId: pto._id
	  , projectId: o.projectId
	  , taskId: o.taskId
	  , hours: o.hours * coefficient
	  , date: o.date
	})
}

getMonth = function(month) {
	switch(month) {
			case 0:
					return 'Jan';
					break;
			case 1:
					return 'Feb';
					break;
			case 2:
					return 'Mar';
					break;
			case 3:
					return 'Apr';
					break;
			case 4:
					return 'May';
					break;
			case 5:
					return 'Jun';
					break;
			case 6:
					return 'Jul';
					break;
			case 7:
					return 'Aug';
					break;
			case 8:
					return 'Sep';
					break;
			case 9:
					return 'Oct';
					break;
			case 10:
					return 'Nov';
					break;
			case 11:
					return 'Dec';
					break;
	}
};

getDay = function(day) {
	switch(day) {
		case 0:
			return 'Sun';
			break;
		case 1:
			return 'Mon';
			break;
		case 2:
			return 'Tue';
			break;
		case 3:
			return 'Wed';
			break;
		case 4:
			return 'Thu';
			break;
		case 5:
			return 'Fri';
			break;
		case 6:
			return 'Sat';
			break;
	}
};

getUTCDate = function(date) {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

isNumeric = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

isPtoOvertimeConflict = function(submittedData) {
	var taskTitle = Tasks.findOne({_id: submittedData.taskId}).title,
			result = false;

	if (taskTitle === 'PTO' || taskTitle === 'Overtime') {
		var searching,
				date = new Date(submittedData.date.getFullYear(), submittedData.date.getMonth(), submittedData.date.getDate());

		switch (taskTitle) {
			case 'Overtime':
				searching = 'PTO';
				break;
			case 'PTO':
				searching = 'Overtime';
				break;
		}

		LoggedTime.find({projectId: submittedData.projectId, userId: Meteor.userId()}).forEach(function (time) {
			var timeDate = new Date(time.date.getFullYear(), time.date.getMonth(), time.date.getDate());
			if (+date === +timeDate) {
				if (!result) {
					result = Tasks.findOne({_id: time.taskId}).title === searching;
				}
			}
		});
	}

	return result;
};

dateFormat = function(date) {
	return getMonth(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear();
};

thisWeeks = function(prev, next) {
	var currentDate = new Date(),
			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
			currentMonday = currentDate,
			weeks = [],
			weekNumber = prev;

	while (currentMonday.getDay() !== 1) {
		currentMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate()-1);
	}

	prevMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate()-7);

	for (var i = prev; i > 0; i--) {
		var dateTo = new Date(prevMonday.getFullYear(), prevMonday.getMonth(), prevMonday.getDate()+6, 23, 59, 59),
				current = prevMonday <= currentDate && dateTo >= currentDate;
		weeks.push({
			id: weekNumber,
			from: prevMonday,
			to: dateTo,
			isCurrent: current
		});
		weekNumber--;
		prevMonday = new Date(prevMonday.getFullYear(), prevMonday.getMonth(), prevMonday.getDate()-7);
	}

	weekNumber = prev+1;

	weeks = weeks.reverse();

	for (var i = next-2; i > 0; i--) {
		var dateTo = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate()+6, 23, 59, 59),
				current = currentMonday <= currentDate && dateTo >= currentDate;
		weeks.push({
			id: weekNumber,
			from: currentMonday,
			to: dateTo,
			isCurrent: current
		});
		weekNumber++;
		currentMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate()+7);
	}

	return weeks;
};

datesFormat = function(dates) {
	var result = [];

	dates.forEach(function (date) {
		result.push({
			id: date.id,
			isCurrent: date.isCurrent,
			from: getMonth(date.from.getMonth()) + ' ' + date.from.getDate(),
			to: dateFormat(date.to)
		});
	});

	return result;
};

getDates = function() {
	if (!Session.get('dates')) {
		Session.set('dates', thisWeeks(6, 7));
	}
	return datesFormat(Session.get('dates'));
};

getWeeks = function() {
	var week = $('#weeks').children(":selected").attr("id"),
			dates = Session.get('dates');

	dates.forEach(function (date) {
		if (date.isCurrent) {
			date.isCurrent = false;
		}
		if (+date.id === +week) {
			date.isCurrent = true;
			Session.set('currentWeek', date);
		}
	});

	Session.set('dates', dates);
};

buttonPlus = function(e) {
	e.preventDefault();

	var data = $('.add-manager').eq(0).clone();
	$('.row').eq($('.row').length-1).after('<div class="row"></div>');
	var inserted = $('.row').eq($('.row').length-1).append(data);
	inserted.find('.add-manager').after('<div class="col-md-6"><button id="minus" type="button" class="btn btn-default"><span class="glyphicon glyphicon-minus"></span></button></div>');
	inserted.find('option:selected').remove();
};

buttonMinus = function(e) {
	e.preventDefault();

	var managerId = $(e.target).closest('.row').find('option:selected').val();
	$(e.target).closest('.row').remove();
	return managerId;
};

getUserProjects = function() {
	if (!Meteor.user().profile.isAdmin) {
		var projects = [];
		Managers.find({userId: Meteor.userId()}).forEach(function (project) {
			projects.push(Projects.findOne({_id: project.projectId}));
		});
		return projects;
	} else {
		return Projects.find();
	}
};

getProjects = function() {
	var projects = [],
			currentWeek = Session.get('currentWeek') || { from: new Date(), to: new Date() },
			userId = Meteor.userId(),
			accessProjects = [],
			from = currentWeek.from,
			to = currentWeek.to,
			loggedTime = [];

	LoggedTime.find().forEach(function (time) {
		var timeDate = new Date(time.date.year, time.date.month, time.date.date);
		if (currentWeek.from <= timeDate && currentWeek.to >= timeDate) {
			loggedTime.push(time);
		}
	});

	UserAccess.find({userId: userId}).forEach(function (access) {
		if (isWeekInAccess()) {
			var project = Projects.findOne({_id: access.projectId});
			accessProjects.push(access.projectId);
			projects.push({
				tasks: getTasks(project, userId, currentWeek, false, loggedTime)
			});
		}

		function isWeekInAccess() {
			var accessDateFrom = new Date(access.dateFrom.year, access.dateFrom.month, access.dateFrom.date),
				accessDateTo = new Date(access.dateTo.year, access.dateTo.month, access.dateTo.date);
			return from >= accessDateFrom && from <= accessDateTo || accessDateFrom >= from && accessDateFrom <= to;
		}
	});

	var loggedProjects = [];

	LoggedTime.find({userId: userId}).forEach(function (time) {
		var timeDate = getUTCDate(new Date(time.date.year, time.date.month, time.date.date));
		if (timeDate >= from && timeDate <= to) {
			var projectId = time.projectId;
			loggedProjects = _.filter(loggedProjects, function(i) {
				return i !== projectId;
			});
			loggedProjects.push(projectId);
		}
	});

	loggedProjects.forEach(function (loggedProject) {
		var project = Projects.findOne({_id: loggedProject}),
				isAccessed = false;
		accessProjects.forEach(function (accessProject) {
			if (accessProject === loggedProject) {
				isAccessed = true;
			}
		});
		if (!isAccessed) {
			projects.push({
				tasks: getTasks(project, userId, currentWeek, false, loggedTime)
			});
		}
	});

	if (UserAccess.findOne({userId: userId, projectId: Projects.findOne({title: 'GSApps'})._id})) {
		if (projects[0].tasks[0].projectTitle === 'GSApps') {
			projects[0].tasks.push(projects[0].tasks.splice(0, 1)[0]);
			projects.push(projects.splice(0, 1)[0]);
		}
	}
	return projects;
};

getWeekDates = function() {
	var weekDates = [],
			dates = Session.get('dates');
	dates.forEach(function (date) {
		if (date.isCurrent) {
			Session.set('currentWeek', date)
		}
	});
	var currentWeek = Session.get('currentWeek');

	while (currentWeek.from <= currentWeek.to) {
		weekDates.push({
			day: getDay(currentWeek.from.getDay()),
			date: getMonth(currentWeek.from.getMonth()) + ' ' + currentWeek.from.getDate(),
			total: getTotal(getUTCDate(currentWeek.from))
		})
		currentWeek.from = new Date(currentWeek.from.getFullYear(), currentWeek.from.getMonth(), currentWeek.from.getDate()+1);
	}

	Session.set('weekDates', weekDates);

	return weekDates;

	function getTotal(date) {
		var total = 0;
		LoggedTime.find({userId: Meteor.userId()}).forEach(function (time) {
			var timeDate = getUTCDate(new Date(time.date.year, time.date.month, time.date.date));
			if (+timeDate === +date) {
				total += parseFloat(time.hours);
			}
		});
		if (!total) {
			total = '';
		}
		return total;
	}
};

getTasks = function(project, userId, currentWeek, locker, loggedTime) {
		var tasks = [],
				currentWeek = currentWeek,
				from = currentWeek.from,
				to =  currentWeek.to;

		Tasks.find({projectId: project._id}).forEach(function (task) {
			var title,
					overtime = task.isOvertime ? 'Overtime' : 'Regular',
					notPTO = true,
					isOvertime = task.isOvertime ? true : false;
			if (task.title !== 'PTO') {
				title = project.title + ' - ' + overtime + ' - ' + task.title;
			} else {
				notPTO = false;
				title = task.title;
			}
			var thisTasks = {
				id: task._id,
				projectTitle: project.title,
				notPTO: notPTO,
				isOvertime: isOvertime,
				title: title,
				hours: getHours(userId, from, to, task, loggedTime),
				total: 0
			};
			thisTasks.hours.forEach(function (hours) {
				if (hours.hours !== '') {
					thisTasks.total += parseFloat(hours.hours);
				}
			});
			if (!thisTasks.total && locker) {
				return;
			}
			if (!thisTasks.total) {
				thisTasks.total = '';
			}
			tasks.push(thisTasks);
		});

		function getHours(userId, from, to, task, loggedTime) {
			var hours = [],
					result = [];
			loggedTime.forEach(function (time) {
				if (time.userId === userId && time.taskId === task._id) {
					var timeDate = new Date(time.date.year, time.date.month, time.date.date);
					hours.push({
						comment: time.comment,
						date: timeDate,
						hours: time.hours
					});
				}
			});
			var date = currentWeek.from;
			// check is hours array is full
			if (hours.length !== 0 && hours.length < 7) {
				for (var i = 1; i <= 7; i++) {
					// trueI equals number of day wich we want to fill
					var trueI = i === 7 ? 0 : i;
					hours.forEach(function (hour) {
						if (hour.date.getDay() === trueI) {
							result[trueI] = hour;
						} else {
							// if result is field continue next
							if (result[trueI] && result[trueI].hours !== '') {
								return;
							} else {
								// search date wich day equals number of day
								while (date.getDay() !== trueI) {
									if (date <= currentWeek.to && currentWeek.from <= date) {
										date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
									} else {
										date = currentWeek.from;
									}
								}
								result[trueI] = {
									date: date,
									hours: ''
								}
							}
						}
					});
				}
				hours = result;
			} else {
				var date = currentWeek.from;
				fillHours(date);
			}

			function fillHours(date) {
				var date = date;
				for (var i = 1; i <= 7; i++) {
					hours.push({
						date: getDate(),
						hours: ''
					});
				}
				function getDate() {
					while (date <= currentWeek.to) {
						var thisDate = date;
						date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
						return thisDate;
					}
				}
			}

			hours = _.sortBy(hours, 'date');

			return hours;
		}
		return tasks;
	};

profileData = function(e) {
	return {
		email: $(e.target).find('[name="email"]').val().trim(),
		firstName: $(e.target).find('[name="firstName"]').val().trim(),
		lastName: $(e.target).find('[name="lastName"]').val().trim(),
		skype: $(e.target).find('[name="skype"]').val().trim(),
		password: $(e.target).find('[name="password"]').val(),
		confirmPassword: $(e.target).find('[name="confirmPassword"]').val(),
		dateOfBirth: $(e.target).find('[name="dateOfBirth"]').val().trim(),
		mobPhone: $(e.target).find('[name="mobPhone"]').val().trim(),
		emergencyPhone: $(e.target).find('[name="emergencyPhone"]').val().trim(),
		address: $(e.target).find('[name="address"]').val().trim(),
		nickname: $(e.target).find('[name="nickname"]').val().trim()
	};
};

getPtoDates = function() {
	var currentDate = new Date(),
			ptoDates = [];
	var ptoDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-1);
	for (var i = 10; i > 0; i--) {
		ptoDate = new Date(ptoDate.getFullYear(), ptoDate.getMonth(), ptoDate.getDate()+1);
		ptoDates.push(ptoDate);
	}
	return ptoDates;
};

getPTO = function(userId, date) {
	var pto = {
				endOfPrior: 0,
				taken: 0,
				duringCurrent: 0,
				endOfCurrent: 0
			};

	if (PTO.findOne({userId: userId}) && PTOHours.findOne({ptoId: PTO.findOne({userId: userId})._id})) {
		PTOHours.find({ptoId: PTO.findOne({userId: userId})._id}).forEach(function (hours) {
			var hoursDate = new Date(hours.date.year, hours.date.month, hours.date.date),
					ptoHours = parseFloat(hours.hours);
			if (hoursDate < date.from) {
				pto.endOfPrior += ptoHours;
			}
			if (hoursDate >= date.from && hoursDate <= date.to) {
				if (ptoHours > 0) {
					pto.duringCurrent += ptoHours;
				}
			}
		});

		var projectId = Projects.findOne({title: 'GSApps'})._id,
				ptoTaken = 0;
		LoggedTime.find({userId: userId, projectId: projectId, taskId: Tasks.findOne({projectId: projectId, title: 'PTO'})._id}).forEach(function (time) {
			var timeDate = new Date(time.date.year, time.date.month, time.date.date);
			if (timeDate >= date.from && timeDate <= date.to) {
				ptoTaken += parseFloat(time.hours);
			}
		});

		pto.taken = +ptoTaken;
		pto.endOfCurrent = pto.endOfPrior + pto.duringCurrent - pto.taken;
		pto.endOfPrior = pto.endOfPrior !== 0 ? pto.endOfPrior.toFixed(2) : pto.endOfPrior;
		pto.duringCurrent = pto.duringCurrent !== 0 ? pto.duringCurrent.toFixed(2) : pto.duringCurrent;
		pto.endOfCurrent = pto.endOfCurrent !== 0 ? pto.endOfCurrent.toFixed(2) : pto.endOfCurrent;
	}

	return pto;
};
