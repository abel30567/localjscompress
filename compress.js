const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const constants = require('./constants');
const root = constants.ROOT;
const destination = constants.TEMP;
const imageminOut = constants.OUTPUT; //constants.IMAGEMIN_OUT;
const opt = constants.OUTPUT;
const files = fs.readdirSync(root);
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
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
  let filesize = fs.statSync(filepath);
  data[count] = {};
  data[count].filename = image;
  data[count].size = filesize['size'];
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

for (let key in data) {
  // Jimp Resize Imagemin Compress
  if (data[key].width > constants.RESIZE_IMAGE_WIDTH && data[key].extension === '.png' && !data[key].special) {   
    if (data[key].size > constants.MAX_HD_IMAGE_SIZE && data[key].width < constants.MEDIAN_HD_IMAGE_WIDTH) {
      // resize with jimp compress with imagemin
      console.log('+++++++++++++++++++++++++');
      console.log('+++++++++++++++++++++++++');
      console.log(`Processing through JIMP + IMAGEMIN and resizing to ${constants.RESIZE_HD_IMAGE_WIDTH}px', ${data[key].filename}`);
      Jimp.read(data[key].filepath, (err, lenna) => {
        if (err) throw err;
        lenna
          .resize(constants.RESIZE_HD_IMAGE_WIDTH, Jimp.AUTO) // resize
          .writeAsync(data[key].destination)
          .then(async () => {
            await compress(data[key].destination, data[key].optimal);
          }) // save; // save
      });
    } else {
      // resize with jimp compress with imagemin
      console.log('+++++++++++++++++++++++++');
      console.log('+++++++++++++++++++++++++');
      console.log(`Processing through JIMP + IMAGEMIN and resizing to ${constants.RESIZE_IMAGE_WIDTH}px', ${data[key].filename}`);
      Jimp.read(data[key].filepath, (err, lenna) => {
        if (err) throw err;
        lenna
          .resize(constants.RESIZE_IMAGE_WIDTH, Jimp.AUTO) // resize
          .writeAsync(data[key].destination)
          .then(async () => {
            await compress(data[key].destination, data[key].optimal);
          }) // save; // save
      });
    }
  }

  if (data[key].width > constants.RESIZE_IMAGE_WIDTH 
    && data[key].extension === '.png' && data[key].special) {
    if (data[key].size > constants.MAX_HD_IMAGE_SIZE 
      && data[key].width < constants.MEDIAN_HD_IMAGE_WIDTH) {
      JimpResizeCompress(data[key].filepath, constants.RESIZE_HD_IMAGE_WIDTH,data[key].optimal);     
    } else {
      JimpResizeCompress(data[key].filepath, constants.RESIZE_IMAGE_WIDTH,data[key].optimal);     
    }    
  }    

  if (data[key].width > constants.RESIZE_IMAGE_WIDTH 
    && data[key].extension !== '.png') {      
    if (data[key].size > constants.MAX_HD_IMAGE_SIZE 
      && data[key].width < constants.MEDIAN_HD_IMAGE_WIDTH) {
      JimpResizeCompress(data[key].filepath, constants.RESIZE_HD_IMAGE_WIDTH,data[key].optimal);     
    } else {
      JimpResizeCompress(data[key].filepath, constants.RESIZE_IMAGE_WIDTH,data[key].optimal);
    } 
  } 
  // Jimp Resize Imagemin Compress
  // Imagemin Compress -- DONE
  if (data[key].width <= constants.RESIZE_IMAGE_WIDTH && !data[key].special) {
    if (data[key].size > constants.MAX_IMAGE_SIZE && data[key].width > constants.RESIZE_HD_IMAGE_WIDTH) {
            // image in size target but too big
            console.log('+++++++++++++++++++++++++');
            console.log('+++++++++++++++++++++++++');
            console.log(`Processing through JIMP + IMAGEMIN and resizing to ${constants.RESIZE_HD_IMAGE_WIDTH}px', ${data[key].filename}`);
      Jimp.read(data[key].filepath, (err, lenna) => {
        if (err) throw err;
        lenna
          .resize(constants.RESIZE_HD_IMAGE_WIDTH, Jimp.AUTO) // resize
          .writeAsync(data[key].destination)
          .then(async () => {
            await compress(data[key].destination, data[key].optimal);
          }); 
      });
    } else {
      // compress with imagemin
      compress(data[key].filepath, data[key].optimal);
    }   
  }

  if (data[key].width <= constants.RESIZE_IMAGE_WIDTH && data[key].special) {
    if (data[key].size > constants.MAX_IMAGE_SIZE && data[key].width > constants.RESIZE_HD_IMAGE_WIDTH) {
      // image in size target but too big
      JimpResizeCompress(data[key].filepath, constants.RESIZE_HD_IMAGE_WIDTH,data[key].optimal);
    } else {
      JimpCompress(data[key].filepath,data[key].optimal)
    }    
  }
}

// JimpResizeCompress
function JimpResizeCompress(filepath, resize,destination) {
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log(`Processing through JIMP and resizing to ${resize}px', ${filepath}`);
  Jimp.read(filepath, (err, image) => {
    if (err) throw err;
    image    
      .resize(resize, Jimp.AUTO) // resize
      .quality(constants.JIMP_QUALITY) // set JPEG quality
      .write(destination);
  });
}



function JimpCompress(filepath, destination) {
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log('Processing through Just JIMP', filepath);
  Jimp.read(filepath, (err, lenna) => {
    if (err) throw err;
    lenna    
      .quality(constants.JIMP_QUALITY) // set JPEG quality
      .write(destination);
  });
}

// Imagemin compress
async function compress(filepath, altDest, min = 0.6, max = 0.8) {
  console.log('compressing through imagemin', filepath);
  console.log('image quality to reduce to', min, max);
  try {
    const files = await imagemin([`${filepath}`], {
      destination: imageminOut,
      plugins: [          
          imageminJpegtran(),
          imageminPngquant({
              quality: [min, max]
          })
      ]
  });
  } catch (e) {
    console.log('=================================');
    console.log('=================================');
    console.log('Failed in processing image', filepath);
    // console.log(e);
    if (e.exitCode === 99) {
      console.log(Date.now(), 'Reprocessing image with JIMP instead', filepath);
      JimpCompress(filepath, altDest);
    }
  }
};
