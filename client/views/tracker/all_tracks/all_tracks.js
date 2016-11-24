Template.allTracks.rendered = function () {
	setTimeout(function() {
		$('.tasksTitle').each(function() {
			if ($(this).text().length >= 72) {
				$(this).text($(this).text().slice(0, 69) + '...');
			}
		});
		document.getElementById('PTO').getElementsByTagName('td')[7].innerHTML = ''
		/*
.getElementsByTagName('tr')
		$('#PTO').each(function() {
			if ($(this).text().length >= 72) {
				$(this).text($(this).text().slice(0, 69) + '...');
			}
		});*/
	}, 300);
};

Template.allTracks.helpers({
	weekDates: function() {
		return getWeekDates();
	},
	projects: function() {
		return getProjects();
	},
	totalTotal: function() {
		var total = 0;

		Session.get('weekDates').forEach(function (date) {
			if (date.total !== '') {
				total += date.total;
			}
		});

		if (!total) {
			total = '';
		}

		return total;
	}
});

Template.allTracks.events({
	'click .tracker tbody td': function(e) {
		e.preventDefault();

		if ($(e.target).hasClass('hours')) {
			if ($('.addComment:hidden').length === 1) {
				openInput(e);
			} else {
				submitData();
				hideTracker();
				openInput(e);
			}
		}
	},
	'keypress #formComments': function(e) {
		keySubmit(e);
	},
	'keypress .tracker td input': function(e) {
		keySubmit(e);
	}
});

function openInput(e) {
	var addHoursInput = $(e.target).find('.addHours input');
	$('.addComment').show();
	$(e.target).find('.addHours').show();
	addHoursInput.width($(e.target).outerWidth());
	addHoursInput.height($(e.target).outerHeight());
	addHoursInput.focus();
	addHoursInput.val($(e.target).text());
	$('#comment').val($(e.target).attr('title'));
	var data = {
		taskId: $(e.target).parent().find('td:first').attr('id'),
		date: $(e.target).attr('id')
	}
	Session.set('data', data);
}

function submitData() {
	var taskId = Session.get('data').taskId
	var task = Tasks.findOne({ _id: taskId })
	var projectId = Projects.findOne({ _id: task.projectId })._id
	var date = new Date(Date.parse(Session.get('data').date))
	var data = {
		userId: Meteor.userId()
	  , projectId: projectId
	  ,	taskId: taskId
	  , date: {
			year: date.getFullYear()
		  ,	month: date.getMonth()
		  ,	date: date.getDate()
		}
	  ,	hours: $('.addHours:visible input').val()
	  ,	comment: $('#comment').val().trim()
	}
	Meteor.call('logTime', data, function(error, result) {
		if (error) throwError(error.reason)
	})
}

function hideTracker() {
	$('.addHours').hide();
	$('.addComment').hide();
}

function keySubmit(e) {
	if(e.keyCode === 13) {
		e.preventDefault();
		submitData();
		hideTracker();
	}
	if (e.keyCode === 27) {
		e.preventDefault();
		hideTracker();
	}
}
