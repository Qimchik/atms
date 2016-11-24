Info = new Meteor.Collection(null);

throwInfo = function(message) {
  Info.insert({message: message, seen: false})
}

Errors = new Meteor.Collection(null);

throwError = function(message) {
  Errors.insert({message: message, seen: false})
}

clearNotifications = function() {
  Info.remove({seen: true});
  Errors.remove({seen: true});
}