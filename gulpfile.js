'use strict';

var gulp = require('gulp');
var replace = require('gulp-replace');

var cryptojs = require('crypto-js');
var marked = require('marked');
var FileSystem = require('fs');
var through = require('through2');
var args = require('yargs').argv;
var PluginError = require('plugin-error');

// Script configs for encrypted data
var unencryptedSrc = "_events/current.md";
var encryptionPassword = args["password"];

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

  // var linesWithLayout = linesWithoutLayout
  //   .splice(0, 1)
  //   .concat('layout: encrypted')
  //   .concat(linesWithoutLayout);

  // var frontMatterWithEncryptedLayout = linesWithLayout.join('\n');
  // return frontMatterWithEncryptedLayout;
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

gulp.task('replace-text', () => {
  return gulp.src('_config.yml')
    .pipe(replace(/(encrypted_event: .*)/g, "encrypted_event: " + '\"' + encryptedEventBody + '\"'))
    .pipe(gulp.dest('./'));
});

/*
  END FIREWALL TASKS
*/

gulp.task('generate-google-calendar-link', () => {
  console.log("hi the google task was run");
  return gulp.src('_events/current.md')
    .pipe(replace(/(class=\"google-cal-link\" href=\".*\")/g, "class=\"google-cal-link\" href=\"test-test-test\""))
    .pipe(gulp.dest('./'));
  // return Promise.resolve('the value is ignored');
});

gulp.task('generate-apple-calendar-file', () => {
  console.log("hi the apple task was run");
  return Promise.resolve('the value is ignored');
});

gulp.task('firewall', gulp.series('generate-google-calendar-link', 'generate-apple-calendar-file', 'firewall:encrypt', 'replace-text'));



gulp.task('default', gulp.series('firewall', (done) => {
  // your tasks here
  done();
}));
