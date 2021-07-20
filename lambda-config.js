'use strict';

require('dotenv').config();

module.exports = {
  region: 'us-east-1',
  handler: 'index.handler',
  description: 'image compressor and resizer',
  role: 'arn:aws:iam::149629872333:role/service-role/S3Thumbs-role-lycuue74',
  functionName: 'S3Thumbs',
  timeout: 3,
  memorySize: 256,
  runtime: 'nodejs14.0'
};
