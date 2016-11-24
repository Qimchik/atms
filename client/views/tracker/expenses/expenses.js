Template.expenses.helpers({
  expenses: function() {
    var expenses = {
      transportation: 0,
      meal: 0,
      lodging: 0,
      officeSupply: 0,
      entertaiment: 0,
      other: 0,
      total: 0
    };

    var currentWeek = Session.get('currentWeek');

    Expenses.find({userId: Meteor.userId()}).forEach(function (expense) {
      var expenseDateFrom = new Date(expense.dateFrom.year, expense.dateFrom.month, expense.dateFrom.date),
          expenseDateTo = new Date(expense.dateTo.year, expense.dateTo.month, expense.dateTo.date),
          currentWeekFrom = new Date(currentWeek.from.getFullYear(), currentWeek.from.getMonth(), currentWeek.from.getDate()),
          currentWeekTo = new Date(currentWeek.to.getFullYear(), currentWeek.to.getMonth(), currentWeek.to.getDate());
      if (+expenseDateFrom === +currentWeekFrom && +expenseDateTo === +currentWeekTo) {
        expenses[expense.type] = expense.cost;
        expenses.total += parseFloat(expense.cost);
      }
    });

    return expenses;
  },
  fileWasUploaded: function() {
    var i = 0;
    return {
      finished: function(index, fileInfo, context) {
        setImagePath();
        function setImagePath() {
          if (i === 0)
            Session.set('imagePath', [fileInfo.url]);
          else {
            var imagePath = Session.get('imagePath');
            imagePath.push(fileInfo.url);
            Session.set('imagePath', imagePath);
          }
          i++;
        }
        submitExpenses();
      }
    };
  }
});

Template.expenses.events({
  'click .expenses tr td': function(e) {
    e.preventDefault();

    hideExpenses();

    Session.set('expensesType', $(e.target).attr('id'));

    var currentWeek = Session.get('currentWeek'),
        expenses = Expenses.findOne({userId: Meteor.userId(), dateFrom: {year: currentWeek.from.getFullYear(), month: currentWeek.from.getMonth(), date: currentWeek.from.getDate()}, 
          dateTo: {year: currentWeek.to.getFullYear(), month: currentWeek.to.getMonth(), date: currentWeek.to.getDate()}, type: Session.get('expensesType')});
    if (expenses) {
      Session.set('imagePath', expenses.imagePath);
    } else {
      Session.set('imagePath', []);
    }

    if ($(e.target).hasClass('expense')) {
      var addExpensesInput = $(e.target).find('.addExpenses input'),
          tdValue = $(e.target).text().trim().slice(2);
      $(e.target).find('.addExpenses').show();
      $('#imageUpload').show();
      addExpensesInput.width($(e.target).outerWidth());
      addExpensesInput.height($(e.target).outerHeight());
      addExpensesInput.focus();
      addExpensesInput.val(tdValue);
      addExpensesInput.select();
    }
  },
  'click .uploadPanel .done': function() {
    submitExpenses();
    hideExpenses();
  },
  'keypress .expenses tr td input': function(e) {
    keypress(e);
  }
});


// Help methods
function keypress(e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    submitExpenses();
    hideExpenses();
  }
  if (e.keyCode === 27) {
    e.preventDefault();
    hideExpenses();
    clearPathes();
  }
}

function hideExpenses() {
  $('.addExpenses').hide();
  $('#imageUpload').hide();
  Session.set('imagePath', null);
}

function clearPathes() {
  Session.set('imagePath', null);
}

function submitExpenses() {
  var currentWeek = Session.get('currentWeek');
  var submittedData = {
    userId: Meteor.userId(),
    type: Session.get('expensesType'),
    cost: $('.addExpenses:visible input').val().trim(),
    imagePath: Session.get('imagePath'),
    dateFrom: {year: currentWeek.from.getFullYear(), month: currentWeek.from.getMonth(), date: currentWeek.from.getDate()},
    dateTo: {year: currentWeek.to.getFullYear(), month: currentWeek.to.getMonth(), date: currentWeek.to.getDate()}
  };

  if (!Locker.findOne({userId: Meteor.userId(), dateFrom: submittedData.dateFrom, dateTo: submittedData.dateTo})) {
    if (!Expenses.findOne({userId: Meteor.userId(), dateFrom: submittedData.dateFrom, dateTo: submittedData.dateTo, type: submittedData.type})) {
      Meteor.call('submitExpenses', submittedData, function (error, result) {
        if (error) {
          return throwError(error.reason);
        }
      });
    } else {
      Meteor.call('editExpenses', submittedData, function (error, result) {
        if (error) {
          return throwError(error.reason);
        }
      });
    }
  } else {
    throwError('This week is locked');
  }
}