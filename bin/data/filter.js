'use strict';

module.exports = function(list, filterID) {
  switch (filterID) {
    case 'filter-new':
      var currentDate = Date.now();
      var threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000;

      list = list.filter(function(item) {
        var diff = currentDate - item.created;
        return diff <= threeDaysInMilliseconds;
      });

      list = list.sort(function(a, b) {
        return b.created - a.created;
      });
      break;

    case 'filter-discussed':
      list = list.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;
  }

  return list;
};
