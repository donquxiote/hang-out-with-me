'use strict';

const gulp = require('gulp');
const gulpReplace = require('gulp-replace');
const cryptojs = require('crypto-js');
const marked = require('marked');
const fs = require('fs');
const through = require('through2');
const args = require('yargs').argv;
const PluginError = require('plugin-error');
const eventGen = require('./gulp_scripts/eventGenerator')

// Script configs for encrypted data
var unencryptedSrc = "_events/current.md";
var encryptionPassword = args["password"];
var eventCreateBool = eventGen.eventCreate(args["event-create"]);
var eventDataJson = JSON.parse(fs.readFileSync("_events/eventData.json"));

var encryptedEventBody;

/*
  START FIREWALL TASKS
*/
function checkEncryptedLayout(frontMatter, filepath) {
  var lines = frontMatter.split('\n'),
    linesWithoutLayout = [],
    hasEncryptedLayout = false;

  lines.forEach(function (line) {
    var layoutTag = 'layout:',
      isLayoutIndex = line.indexOf(layoutTag),
      isLayout = isLayoutIndex >= 0,
      isEncryptedLayout = line.indexOf('encrypted') >= (isLayoutIndex + layoutTag.length);

    if (isLayout) {
      // in case of multiple instances of layout
      hasEncryptedLayout = isEncryptedLayout ? true : false;
    }
  });

  if (!hasEncryptedLayout) {
    console.log('[WARNING] ' + filepath + ': protected file not using encrypted layout.');
  }
}

function encrypt(password) {
  return through.obj(function (file, encoding, callback) {
    if (file.isNull() || file.isDirectory()) {
      this.push(file);
      return callback();
    }

    // No support for streams
    if (file.isStream()) {
      this.emit('error', new PluginError({
        plugin: 'Encrypt',
        message: 'Streams are not supported.'
      }));
      return callback();
    }

    if (file.isBuffer()) {
      var delimiter = '---',
        chunks = String(file.contents).split(delimiter),
        originalBody = chunks[0],
        frontMatter = '';

      if (chunks.length === 3) {
        checkEncryptedLayout(chunks[1], file.path);
        frontMatter = chunks[1];
        originalBody = chunks[2];
      } else if (chunks.length > 1) {
        this.emit('error', new PluginError({
          plugin: 'Encrypt',
          message: file.path + ': protected file has invalid front matter.'
        }));
        return callback();
      }

      var encryptedBody = cryptojs.AES.encrypt(marked(originalBody), password),
          hmac = cryptojs.HmacSHA256(encryptedBody.toString(), cryptojs.SHA256(password).toString()).toString();

      encryptedEventBody = hmac + encryptedBody;
      return callback();
    }
  });
}

gulp.task('firewall:encrypt', () => {
  return gulp.src(unencryptedSrc)
    .pipe(encrypt(encryptionPassword))
    .pipe(gulp.dest('_posts'));
});

gulp.task('firewall:replace-text', () => {
  return gulp.src('_config.yml')
    .pipe(gulpReplace(/(encrypted_event: .*)/g, "encrypted_event: " + '\"' + encryptedEventBody + '\"'))
    .pipe(gulp.dest('./'));
});

/*
  END FIREWALL TASKS
*/

/*
  START CALENDAR LINK TASKS
*/

gulp.task('eventFileCreate:display', () => {
  if (eventCreateBool){
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class=\"body__add-cal-event\".*\>)/g, "class=\"body__add-cal-event\">"));
  } else {
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class=\"body__add-cal-event\".*\>)/g, "class=\"body__add-cal-event\" hidden>"));
  };
});

gulp.task('eventFileCreate:google', () => {
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(
        gulpReplace(
          /(class=\"google-cal-link\" href=\".*\")/g,
          "class=\"google-cal-link\" href=\"" + eventGen.googleCalendarLink(eventDataJson) + "\""
        )
      )
      .pipe(gulp.dest('_events/'));
  } else {
    console.log("Add to Google Calendar section will be hidden")
    return Promise.resolve('the value is ignored');
  };
});

gulp.task('eventFileCreate:apple', () => {
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(
        gulpReplace(
          /(class=\"apple-cal-link\" href=\".*\")/g,
          "class=\"apple-cal-link\" href=\"" + eventGen.appleCalendarLink(eventDataJson) + "\""
        )
      )
      .pipe(gulp.dest('_events/'));
  } else {
    console.log("Add to Apple Calendar section will be hidden")
    return Promise.resolve('the value is ignored');
  };
});

/*
  END CALENDAR LINK TASKS
*/

gulp.task('eventFileCreate', gulp.series('eventFileCreate:display', 'eventFileCreate:google', 'eventFileCreate:apple'));

gulp.task('firewall', gulp.series('firewall:encrypt', 'firewall:replace-text'));

gulp.task('default',
  gulp.series(
    'eventFileCreate',
    'firewall',
    (done) => {
      done();
    }
  )
);
