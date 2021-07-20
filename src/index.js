const gm = require('gm').subClass({ imageMagick: false });
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context, cb) => {
  const validExtensions = ['jpg', 'jpeg', 'png'];

  const { bucket, object } = event.Records[0].s3;

  // Where optimized images will be saved
  const dest = 'thumbs/';

  // Object key may have spaces or unicode non-ASCII characters. Remove prefix
  const fullFileName = decodeURIComponent(object.key.replace(/\+/g, ' '))
    .split('/').pop();

  const [fileName, fileExt] = fullFileName.split('.');

  if (!validExtensions.includes(fileExt)) {
    return cb(null, `Image not processed due to .${fileExt} file extension`);
  }

  // Download image from S3
  const s3Image = await s3.
    getObject({
      Bucket: bucket.name,
      Key: object.key
    })
    .promise();

  function gmToBuffer(data) {
    return new Promise((resolve, reject) => {
      data.stream((err, stdout, stderr) => {
        if (err) { return reject(err) }
        const chunks = []
        stdout.on('data', (chunk) => { chunks.push(chunk) })
        stdout.once('end', () => { resolve(Buffer.concat(chunks)) })
        stderr.once('data', (data) => { reject(String(data)) })
      })
    })
  }

  function getStream(body, size, quality) {
    const data = gm(body)
      .resize(size)
      .quality(quality);

    return gmToBuffer(data);
  }

  // use null to optimize image without resizing
  const sizes = [420, 240, 128];

  // Uploades all images to S3
  const uploadPromises = sizes.map(async size => {
    // Optimize image with current size
    const readableStream = await getStream(s3Image.Body, size, 60);
    const key = size
      ? `${dest}${fileName}_thumb_${size}.${fileExt}`
      : `${dest}${fileName}_original.${fileExt}`;

    return s3.putObject({
      Bucket: bucket.name,
      Key: key,
      Body: readableStream,
    }).promise();
  });

  var results = await Promise.all(uploadPromises);
  console.log('RESULTS', results);
  cb(null, 'finished');
};