Template.pto.helpers({
  FTE: function() {
    return UserAccess.findOne({userId: Meteor.userId(), projectId: Projects.findOne({title: 'GSApps'})._id})
  },
  pto: function() {
    return getPTO(Meteor.userId(), Session.get('currentWeek'));
  }
});

Template.pto.events({
	'click .table tbody .soldHours': function(e) {
		//alert('sdf');
		//e.preventDefault();
		openInput(e);
		//if ($(e.target).hasClass('hours')) {
				//submitData();
				//hideTracker();
				//openInput(e);
		//}
	},
	'blur .table tbody .soldHours': function(e) {
		submitData();
		hideTracker();
	},
	'keypress .table td input': function(e) {
		keySubmit(e);
	}
});

function openInput(e) {
	var addHoursInput = $(e.target).find('.soldHoursDiv input');
	$(e.target).find('.soldHoursDiv').show();
	addHoursInput.width($(e.target).outerWidth());
	addHoursInput.height($(e.target).outerHeight());
	addHoursInput.focus();
}

function submitData() {
	
	/*var data = {
		userId: Meteor.userId()
	  , date: {
			year: date.getFullYear()
		  ,	month: date.getMonth()
		  ,	date: date.getDate()
		}
	  ,	hours: $('.soldHoursDiv:visible input').val()
	}
	Meteor.call('logSold', data, function(error, result) {
		if (error) throwError(error.reason)
	})*/
	var taskId = Tasks.findOne({ title: "PTO" })._id//'en4txks2BpdkqZCz5'
	var task = Tasks.findOne({ _id: taskId })
	var projectId = Projects.findOne({ _id: task.projectId })._id
	var date = Session.get('currentWeek').to;
	var data = {
		userId: Meteor.userId()
	  , projectId: projectId
	  ,	taskId: taskId
	  , date: {
			year: date.getFullYear()
		  ,	month: date.getMonth()
		  ,	date: date.getDate()
		}
	  ,	hours: $('.soldHoursDiv:visible input').val()
	  ,	comment: ''
	  ,	sold: 'true'
	}

	Meteor.call('logTime', data, function(error, result) {
		if (error) throwError(error.reason)
	})
}

function hideTracker() {
	$('.soldHoursDiv').hide();
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
