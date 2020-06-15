const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');



(async () => {
  try {
    const files = await imagemin(['uploads/*.{jpg,png,jpeg}'], {
      destination: 'compressed',
      plugins: [
          // imageminJpegtran(),
          imageminMozjpeg({
            quality: 50
          }),
          imageminPngquant({
              quality: [0.6, 0.8]
          })
      ]
  });

  console.log(files);
  //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …] 
  } catch (e) {
    console.log(e);
  }
})();