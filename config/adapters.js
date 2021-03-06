/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */
 
var fs = require('fs');

module.exports.adapters = {

  // If you leave the adapter config unspecified 
  // in a model definition, 'default' will be used.
  'default': 'mysql-default',

  // Persistent adapter for DEVELOPMENT ONLY
  // (data is preserved when the server shuts down)
  disk: {
    module: 'sails-disk'
  },

  // MySQL is the world's most popular relational database.
  // Learn more: http://en.wikipedia.org/wiki/MySQL
  'mysql-default': {

    module: 'sails-mysql',
    pool: true,
    connectionLimit : 50,
    database: 'appdata_master'
    /*
    ssl : {
      cert : fs.readFileSync('/opt/aws/mysql-ssl-ca-cert.pem')
    },
    initialize : [
      "SET NAMES 'utf8'",
      "SET SESSION group_concat_max_len=65536",
      "SET SESSION wait_timeout=120"
    ]*/
  }
};