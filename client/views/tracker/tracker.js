Template.tracker.rendered = function () {
	$('body').on('click', function(e) {
		if ($(e.target).attr('id') === 'comment' || $(e.target).closest('#imageUpload').length) {
			return true;
		}
		if ($(e.target).closest('.tracker').length || $(e.target).closest('.expenses').length) {
			return true;
		}
		hideTracker();
		hideExpenses();
	});
};

Template.tracker.helpers({
	dates: function() {
		return getDates();
	},
	checked: function() {
		var currentWeek = Session.get('currentWeek');
		return currentWeek && Checked.findOne({
			userId: Meteor.userId()
		  , dateFrom: {
				year: currentWeek.from.getFullYear()
			  , month: currentWeek.from.getMonth()
			  , date: currentWeek.from.getDate()
			}
		  , dateTo: {
				year: currentWeek.to.getFullYear()
			  , month: currentWeek.to.getMonth()
			  , date: currentWeek.to.getDate()
			}
		})
	},
	images: function() {
		return Session.get('imagePath');
	},
	clearPathes: function() {
		Session.set('imagePath', null);
	}
});

Template.tracker.events({
	'change #weeks': function() {
		getWeeks();

		getProjects();
		$('#addHours').hide();
	},
	'change input#completed': function(e) {
		var currentWeek = Session.get('currentWeek');
		var submittedData = {
			dateFrom: {
				year: currentWeek.from.getFullYear(),
				month: currentWeek.from.getMonth(),
				date: currentWeek.from.getDate()
			},
			dateTo: {
				year: currentWeek.to.getFullYear(),
				month: currentWeek.to.getMonth(),
				date: currentWeek.to.getDate()
			},
			prop: $(e.target).prop('checked')
		}

		Meteor.call('checkWeek', submittedData, function (error, result) {
			if (error)
				throwError(error.reason);
		});
	},
	'click .close': function(e) {
		e.preventDefault();
		var imagePath = $(e.target).closest('.col-md-3').find('img').attr('src'),
				currentWeek = Session.get('currentWeek'),
				date = {
					from: {
						year: currentWeek.from.getFullYear(),
						month: currentWeek.from.getMonth(),
						date: currentWeek.from.getDate()
					},
					to: {
						year: currentWeek.to.getFullYear(),
						month: currentWeek.to.getMonth(),
						date: currentWeek.to.getDate()
					}
				};
		Meteor.call('removeImage', imagePath, date, function (error, result) {
			if (error)
				return throwError(error.reason);
			var currentWeek = Session.get('currentWeek'),
					expenses = Expenses.findOne({userId: Meteor.userId(), dateFrom: date.from, dateTo: date.to, type: Session.get('expensesType')});
			if (expenses) {
				Session.set('imagePath', expenses.imagePath);
			} else {
				Session.set('imagePath', []);
			}
		});
	}
});

function hideTracker() {
	$('.addHours').hide();
	$('.addComment').hide();
}

function hideExpenses() {
	$('.addExpenses').hide();
	$('#imageUpload').hide();
	Session.set('imagePath', null);
}
