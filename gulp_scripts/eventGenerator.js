'use strict'

const ics = require('ics')
const cryptoRandomString = require('crypto-random-string')
const fs = require('fs')

module.exports = {

  googleCalendarLink: function (json) {
    var baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE'
    var title = '&text=' + encodeURI(json['title'])
    var description = '&details=' + encodeURI(json['description'])
    var location = '&location=' + encodeURI(json['location'])
    var allDayBool = json['allDayBool']
    var fullDate
    if (allDayBool === true) {
      fullDate = gCalDateAllDay(json['startDate'], json['endDate'])
    } else {
      fullDate = gCalTimedDate(json['startDate'], json['endDate'])
    }

    var linkString = baseUrl + title + description + location + fullDate
    return linkString
  },

  appleCalendarLink: function (json) {
    var eventIcsFilePath = eventFilePath()
    ics.createEvent({
      title: json['title'],
      description: json['descriptions'],
      start: appleEventDateStart(json['startDate'], json),
      end: appleEventDateEnd(json['endDate'], json)
    }, (error, value) => {
      if (error) {
        console.log(error)
      }
      fs.writeFileSync(eventIcsFilePath, value)
    })

    return '/hang-out-with-me/' + eventIcsFilePath
  },
  eventCreate: function (input) {
    switch (input) {
      case 't':
        return true
      case 'f':
        return false
      default:
        console.log('Invalid input, use t or f, event section will be hidden by default')
        return false
    };
  }
}

function eventFilePath () {
  var pathString = cryptoRandomString({ length: 28, type: 'url-safe' })
  fs.mkdirSync('event_files/' + pathString)
  fs.closeSync(fs.openSync('event_files/' + pathString + '/event.ics', 'w'))
  return 'event_files/' + pathString + '/event.ics'
};

function gCalDateAllDay (startDate, endDate) {
  var startString = startDate['year'] + startDate['month'] + startDate['day']
  var endString = endDate['year'] + endDate['month'] + endDate['day']

  return '&dates=' + startString + '/' + endString
};

function gCalTimedDate (startDate, endDate) {
  var startString = startDate['year'] + startDate['month'] + startDate['day'] + 'T' + startDate['hour'] + startDate['minute'] + '00'
  var endString = endDate['year'] + endDate['month'] + endDate['day'] + 'T' + endDate['hour'] + endDate['minute'] + '00'

  return '&dates=' + startString + '/' + endString
};

function appleEventDateStart (startDate, json) {
  if (json['allDayBool']) {
    return [parseInt(startDate['year']), parseInt(startDate['month']), parseInt(startDate['day'])]
  } else {
    return [parseInt(startDate['year']), parseInt(startDate['month']), parseInt(startDate['day']), parseInt(startDate['hour']), parseInt(startDate['minute'])]
  }
};

function appleEventDateEnd (endDate, json) {
  if (json['allDayBool']) {
    return [parseInt(endDate['year']), parseInt(endDate['month']), parseInt(endDate['day'])]
  } else {
    return [parseInt(endDate['year']), parseInt(endDate['month']), parseInt(endDate['day']), parseInt(endDate['hour']), parseInt(endDate['minute'])]
  }
};
