const req = require('request');

module.exports = class Api {
    static get(endpoint, path) {
        return new Promise(function(resolve, reject) {
            var options;
            options = {
              method: 'GET',
              headers: {},
              timeout: 30000
            };
            options.uri = endpoint + path;
            return req(options, function(err, res, body) {
                if (err) {
                    console.log('ERROR:', err, res);
                    reject(err);
                } else {
                    if([200,201,202,203,204,205,206].indexOf(res.statusCode) !== -1) {
                        resolve(body);
                    }
                    else {
                        console.log('STATUSCODE:', res.statusCode);
                        reject(err);
                    }
                }
            });
        });
    }

    static postByFormData(endpoint, path, payload) {
        return new Promise(function(resolve, reject) {
            var options;
            options = {
                method: 'POST',
                headers: {
                  'Accept': 'application/json'
                }
            };
            options.url = endpoint + path;
            options.formData = payload;
            return req(options, function(err, res, body) {
              if (err) {
                reject(err);
              } else {
                resolve(body);
              }
            });
        });
    }

    static postByBody(endpoint, path, payload) {
        return new Promise(function(resolve, reject) {
            var options;
            options = {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json; charset=UTF-8'
                }
            };
            options.url = endpoint + path;
            options.body = JSON.stringify(payload);
            return req(options, function(err, res, body) {
              if (err) {
                reject(err);
              } else {
                resolve(body);
              }
            });
        });
    }
}