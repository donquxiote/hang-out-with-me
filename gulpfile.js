'use strict'

const gulp = require('gulp')
const gulpReplace = require('gulp-replace')
const fs = require('fs')
const args = require('yargs').argv
const eventGen = require('./gulp_scripts/eventGenerator')
const e8n = require('./gulp_scripts/encrypt')
const del = require('del')

// Script configs for encrypted data
var unencryptedSrc = '_events/current.md'
var encryptionPassword = args['password']
var eventCreateBool = eventGen.eventCreate(args['event-create'])
var eventDataJson = JSON.parse(fs.readFileSync('_events/eventData.json'))

/*
  START CALENDAR LINK TASKS
*/

gulp.task('eventFileCreate:display', () => {
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class="body__add-cal-event".*>)/g, 'class="body__add-cal-event">'))
  } else {
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class="body__add-cal-event".*>)/g, 'class="body__add-cal-event" hidden>'))
  };
})

gulp.task('eventFileCreate:google', () => {
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(
        gulpReplace(
          /(class="google-cal-link" href=".*")/g,
          'class="google-cal-link" href="' + eventGen.googleCalendarLink(eventDataJson) + '"'
        )
      )
      .pipe(gulp.dest('_events/'))
  } else {
    console.log('Add to Google Calendar section will be hidden')
    return Promise.resolve('the value is ignored')
  };
})

// add gulp task to delete all items in event_files dir each time first.
gulp.task('eventFileCreate:cleanEventFiles', function () {
  return del(['event_files/**', '!event_files'])
})

gulp.task('eventFileCreate:apple', () => {
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(
        gulpReplace(
          /(class="apple-cal-link" href=".*")/g,
          'class="apple-cal-link" href="' + eventGen.appleCalendarLink(eventDataJson) + '"'
        )
      )
      .pipe(gulp.dest('_events/'))
  } else {
    console.log('Add to Apple Calendar section will be hidden')
    return Promise.resolve('the value is ignored')
  };
})

/*
  END CALENDAR LINK TASKS
*/

/*
  START FIREWALL TASKS
*/

gulp.task('firewall:encrypt', () => {
  return gulp.src(unencryptedSrc)
    .pipe(e8n.encrypt(encryptionPassword))
    .pipe(gulp.dest('_posts'))
})

gulp.task('firewall:replace-text', () => {
  return gulp.src('_config.yml')
    .pipe(gulpReplace(/(encrypted_event: .*)/g, 'encrypted_event: ' + '"' + e8n.exportedBody.body + '"'))
    .pipe(gulp.dest('./'))
})

/*
  END FIREWALL TASKS
*/

gulp.task('eventFileCreate',
  gulp.series('eventFileCreate:display',
    'eventFileCreate:google',
    'eventFileCreate:cleanEventFiles',
    'eventFileCreate:apple'
  )
)

gulp.task('firewall', gulp.series('firewall:encrypt', 'firewall:replace-text'))

gulp.task('default',
  gulp.series(
    'eventFileCreate',
    'firewall',
    (done) => {
      done()
    }
  )
)
