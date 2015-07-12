var _ = require('lodash');
var fs = require('fs');
var path = require('path');

// Default config.
var config = {
  "debug": true,

  "host": "0.0.0.0",
  "port": 5000,

  "secret": "b^~BN-IdQ9{gdp5sa2K$N=d5DV06eN7Y)sjZf:69dUj.3JWq=o",
  "static": "static",

  "auth": true,

  "elasticsearch": {
    "url": "http://127.0.0.1:9200"
  },

  "ldap": {
    "url": "ldap://127.0.0.1:389",
    "searchBase": "dc=sectong,dc=com",
    "searchFilter": "(uid={{username}})",
    "searchAttributes": ["cn", "uid", "mail", "givenName", "sn", "memberOf"],
    "adminDn": "cn=Manager,dc=sectong,dc=com",
    "adminPassword": "secret"
  },

  "pcap": {
    "url": "http://127.0.0.1:5000/sample/pcap",
    "mock": true
  },

  "permissions": {
    "pcap": ["cn=investigators,ou=groups,dc=opensoc,dc=dev"]
  }
};

// Development config loaded from top level config.json.
try {
  config = _.merge(config, require('../config'));
  console.log('Loaded config overrides:', path);
  return config;
} catch(err) {
  if (err.code != 'MODULE_NOT_FOUND') {
    throw err;
  }
}

// Production config loaded from npm package settings.
if (process.env.NODE_ENV == 'production') {
  var homedir = (
    process.env.HOME ||
    process.env.HOMEPATH ||
    process.env.USERPROFILE
  );

  var user_config_path = path.join(homedir, '.opensoc-ui');
  var config_path = fs.existsSync(user_config_path) ? user_config_path :
    process.env.npm_package_config_path || process.env.OPENSOC_UI_CONFIG;

  if (!config_path) {
    console.log('Error: No config file provided.');
    console.log('Set the environment variable "OPENSOC_UI_CONFIG"');
    console.log('to the path of your json configuration file.');
    process.exit(1);
  }

  config.debug = false;
  config.auth = false;
  config.pcap.mock = false;
  config.static = 'static_dist';

  try {
    console.log('Loading config from ', config_path)
    var config_prod = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    config = _.merge(config, config_prod);
  } catch(err) {
    if (err.name == 'SyntaxError') {
      console.log('Malformed JSON in config file: ', config_path);
      process.exit(1);
    }
    else if (err.code == 'ENOENT') {
      console.log('Unable to find config file: ', config_path);
      process.exit(1);
    }

    throw err;
  }
}

exports = module.exports = config;
