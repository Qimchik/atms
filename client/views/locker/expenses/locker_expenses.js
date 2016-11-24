Template.lockerExpenses.helpers({
  expenses: function () {
    var userId = this.userId,
        currentWeek = Session.get('currentWeek'),
        expenses = [];
    Expenses.find({userId: userId, dateFrom: currentWeek.from, dateTo: currentWeek.to}).forEach(function (expense, i) {
      var type = expense.type === 'officeSupply' ? 'Office Supply' : expense.type.charAt(0).toUpperCase() + expense.type.slice(1);
      var images = [];
      expense.imagePath.forEach(function (path) {
        images.push(path);
      });
      expenses.push({
        index: i,
        type: type,
        cost: expense.cost,
        images: images
      });
    });
    return expenses;
  }
});