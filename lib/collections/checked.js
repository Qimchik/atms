Checked = new Mongo.Collection('checked');

Meteor.methods({
  checkWeek: function(submittedData) {
    if (submittedData.prop) {
      Checked.insert({userId: this.userId, dateFrom: submittedData.dateFrom, dateTo: submittedData.dateTo});
    } else {
      Checked.remove({userId: this.userId, dateFrom: submittedData.dateFrom, dateTo: submittedData.dateTo});
    }
  }
});