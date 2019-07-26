'use strict';

var gulp = require('gulp');
var replace = require('gulp-replace');

var cryptojs = require('crypto-js');
var marked = require('marked');
var FileSystem = require('fs');
var through = require('through2');
var PluginError = require('plugin-error');

// Script configs for encrypted data
var unencryptedSrc = "_events/current.md";
var encryptionPassword = "password";

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
  console.log(encryptedEventBody)
  return gulp.src('_config.yml')
    .pipe(replace(/(encrypted_event: .*)/g, "encrypted_event: " + '\"' + encryptedEventBody + '\"'))
    .pipe(gulp.dest('./'));
});

// gulp.task('firewall:watch', () => {
//   gulp.watch(unencryptedSrc, ['encrypt']);
// });

// gulp.task('firewall', ['firewall:encrypt', 'replace-text', 'firewall:watch'], () => { });
gulp.task('firewall', gulp.series('firewall:encrypt', 'replace-text'));

/*
  END FIREWALL TASKS
*/

gulp.task('default', gulp.series('firewall', (done) => {
  // your tasks here
  console.log("Event has been encrypted and added to _config.yml")
  done();
}));
