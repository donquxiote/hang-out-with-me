'use strict';

var gulp = require('gulp');
var gulpReplace = require('gulp-replace');
var cryptojs = require('crypto-js');
var marked = require('marked');
var fs = require('fs');
var through = require('through2');
var args = require('yargs').argv;
var PluginError = require('plugin-error');

// Script configs for encrypted data
var unencryptedSrc = "_events/current.md";
var encryptionPassword = args["password"];
var eventCreateBool = eventCreate(args["event-create"]);
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

function googleCalendarLink() {

  base_url = "https://www.google.com/calendar/render?action=TEMPLATE";
  title = "&text=" + encodeURI(eventDataJson["title"]);
  description = "&details=" + encodeURI(eventDataJson["description"]);
  location = "&location=" + encodeURI(eventDataJson["location"]);
  fullDate;
  if (eventDataJson["allDay"] == "true"){
    // fullDate = all day function
  } else {
    // fullDate = start/end time function
  }
  startDate = gCalDateConcert(eventDataJson["startDate"]);
  endDate = gCalDateConcert(eventDataJson["endDate"]);



  // https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/master/services/google.md

  // linkString
  // return linkString
};

function appleCalendarLink() {
  console.log("got into calendar function")
  // eventTitle = gulp.src('_events/current.md').pipe()

  // linkString
  // return linkString
};

function eventCreate(input) {
  switch (input) {
    case "t":
      return true
    case "f":
      return false
    default:
      console.log("Invalid input, use t or f, event section will be hidden by default")
      return false
  }

};


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
  console.log("hi the google task was run");
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class=\"google-cal-link\" href=\".*\")/g, googleCalendarLink()))
      .pipe(gulp.dest('_events/'));
  } else {
    console.log("noting was done");
    return Promise.resolve('the value is ignored');
  };
});

gulp.task('eventFileCreate:apple', () => {
  console.log("hi the apple task was run");
  if (eventCreateBool) {
    return gulp.src('_events/current.md')
      .pipe(gulpReplace(/(class=\"apple-cal-link\" href=\".*\")/g, appleCalendarLink()))
      .pipe(gulp.dest('_events/'));
  } else {
    console.log("noting was done");
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
