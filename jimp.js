const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const constants = require('./constants');
const root = constants.ROOT;
const destination = constants.TEMP;
const imageminOut = constants.IMAGEMIN_OUT;
const opt = constants.OUTPUT;
const files = fs.readdirSync(root);
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const targetFiles = files.filter((file) => {
  return (
    path.extname(file).toLowerCase() === '.jpg' ||
    path.extname(file).toLowerCase() === '.png' ||
    path.extname(file).toLowerCase() === '.jpeg' 
    );
});
// console.log(targetFiles);
let data = {};
let count = 0;
targetFiles.forEach(image => {
  let filepath = root + '/' +image;
  let out = destination + '/' +image;
  let optim = opt + '/' +image;
  // console.log('filepath', filepath);
  let dimensions = sizeOf(filepath);
  data[count] = {};
  data[count].filename = image;
  data[count].extension =  path.extname(image).toLowerCase();
  data[count].filepath = filepath;
  data[count].destination = out;
  data[count].optimal = optim;
  data[count].width = dimensions.width;
  if (image.includes('(')) {
    data[count].special = true;
  } else { data[count].special = false; }
  ++count;
});
console.log(data);

let len = Object.keys(data).length;
// console.log(len);

for (let key in data) {
  if (data[key].width > 600 && data[key].extension === '.png' && !data[key].special) {    
    // resize with jimp compress with imagemin
    console.log('+++++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++');
    console.log('Processing through JIMP + IMAGEMIN', data[key].filename);
    Jimp.read(data[key].filepath, (err, lenna) => {
      if (err) throw err;
      lenna
        .resize(600, Jimp.AUTO) // resize
        // .quality(60) // set JPEG quality
        .writeAsync(data[key].destination)
        .then(async () => {
          await compress(data[key].destination, data[key].optimal);
        }) // save; // save
    });
  }
  if (data[key].width > 600 && data[key].extension === '.png' && data[key].special) {
    console.log('+++++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++');
    console.log('Processing through Just JIMP', data[key].filename);
    // resize and compress with jimp
    Jimp.read(data[key].filepath, (err, lenna) => {
      if (err) throw err;
      lenna
        .resize(600, Jimp.AUTO) // resize
        .quality(60) // set JPEG quality
        .write(data[key].optimal);
    });
  }    

  if (data[key].width > 600 && data[key].extension !== '.png') {
    console.log('+++++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++');
    console.log('Processing through Just JIMP', data[key].filename);
    // resize and compress with jimp
    Jimp.read(data[key].filepath, (err, lenna) => {
      if (err) throw err;
      lenna
        .resize(600, Jimp.AUTO) // resize
        .quality(60) // set JPEG quality
        .write(data[key].optimal);
    });
  } 
  if (data[key].width <= 600 && !data[key].special) {
    console.log('+++++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++');
    console.log('Processing through Just IMAGEMIN', data[key].filename);
    // compress with imagemin
    compress(data[key].filepath, data[key].optimal);
  }
  if (data[key].width <= 600 && data[key].special) {
    console.log('+++++++++++++++++++++++++');
    console.log('+++++++++++++++++++++++++');
    console.log('Processing through Just JIMP', data[key].filename);
    Jimp.read(data[key].filepath, (err, lenna) => {
      if (err) throw err;
      lenna        
        .quality(60) // set JPEG quality
        .write(data[key].optimal);
    });
  }
}

function JimpCompress(filepath, destination) {
  Jimp.read(filepath, (err, lenna) => {
    if (err) throw err;
    lenna    
      .quality(60) // set JPEG quality
      .write(destination);
  });
}

async function compress(filepath, altDest, min = 0.6, max = 0.8) {
  console.log('compressing through imagemin', filepath);
  console.log('image quality to reduce to', min, max);
  try {
    const files = await imagemin([`${filepath}`], {
      destination: imageminOut,
      plugins: [          
          // imageminMozjpeg({
          //   quality: 70
          // }),
          imageminJpegtran(),
          imageminPngquant({
              quality: [min, max]
          })
      ]
  });
  // console.log(files);
  //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …] 
  } catch (e) {
    console.log('=================================');
    console.log('=================================');
    console.log('Failed in processing image', filepath);
    // console.log(e);
    if (e.exitCode === 99) {
      console.log(Date.now(), 'Reprocessing image with JIMP instead', filepath);
      // compress(filepath, 0.7, 0.9);
      JimpCompress(filepath, altDest);
    }
  }
};

// Jimp.read('shika1.png', (err, lenna) => {
//   if (err) throw err;
//   lenna
//     .resize(600, Jimp.AUTO) // resize
//     .quality(60) // set JPEG quality
//     .write('jimpTest.png'); // save
// });