'use strict';

const PluginError = require('plugin-error');
const cryptojs = require('crypto-js');
const marked = require('marked');
const through = require('through2');


function exportedBody() { };

module.exports = {
  exportedBody: exportedBody,
  encrypt: function (password) {
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

        module.exports.exportedBody.body = hmac + encryptedBody;
        return callback();
      }
    });
  }
};

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
};
