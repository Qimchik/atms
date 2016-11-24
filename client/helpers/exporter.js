MyAppExporter = { 
  exportProject: function(projectId, dates) {
    var self = this;
    Meteor.call("exportProject", projectId, dates, function(error, result) {
      if (error) {
        return alert(error.reason);
      }
      var csv = Papa.unparse(result),
          date = getMonth(dates.from.getMonth()) + ' ' + dates.from.getDate() + ' - ' + getMonth(dates.to.getMonth()) + ' ' + dates.to.getDate();
      self._downloadCSVProject(csv, result, Projects.findOne({_id: projectId}).title, date);
    });
  },
  exportPTO: function(dates) {
    var self = this;
    Meteor.call('exportPTO', dates, function (error, result) {
      if (error) {
        return alert(error.reason);
      }
      var csv = Papa.unparse(result),
          date = getMonth(dates.from.getMonth()) + ' ' + dates.from.getDate() + ' - ' + getMonth(dates.to.getMonth()) + ' ' + dates.to.getDate();
      self._downloadCSVPTO(csv, result, date);
    });
  },
  exportExpenses: function(dates) {
    var self = this;
    Meteor.call('exportExpenses', dates, function (error, result) {
      if (error) {
        return alert(error.reason);
      }
      var csv = Papa.unparse(result),
          date = getMonth(dates.from.getMonth()) + ' ' + dates.from.getDate() + ' - ' + getMonth(dates.to.getMonth()) + ' ' + dates.to.getDate();
      self._downloadCSVExpenses(csv, result, date);
    });
  },
 
  _downloadCSVProject: function(csv, data, title, date) {
    var blob = new Blob([csv]);
    var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
      a.download = title + " " + date + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  },
  _downloadCSVPTO: function(csv, data, date) {
    var blob = new Blob([csv]);
    var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
      a.download = 'PTO ' + date + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  },
  _downloadCSVExpenses: function(csv, data, date) {
    var blob = new Blob([csv]);
    var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
      a.download = 'Expenses ' + date + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }
};