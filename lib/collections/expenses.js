Expenses = new Mongo.Collection('expenses');

Meteor.methods({
  submitExpenses: function(submittedData) {
    Expenses.insert(submittedData);
  },
  editExpenses: function(submittedData) {
    var expensesId = Expenses.findOne({userId: submittedData.userId, dateFrom: submittedData.dateFrom, dateTo: submittedData.dateTo, type: submittedData.type})._id;
    Expenses.update({_id: expensesId}, submittedData);
  }
});