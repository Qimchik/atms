Template.info.helpers({
  info: function() {
    return Info.find();
  }
});

Template.infoItem.rendered = function() {
  var infoItem = this.data;
  Meteor.defer(function() {
    Info.update(infoItem._id, {$set: {seen: true}});
  });
};

Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

Template.error.rendered = function() {
  var error = this.data;
  Meteor.defer(function() {
    Errors.update(error._id, {$set: {seen: true}});
  });
};