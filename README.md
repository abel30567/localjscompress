# localjscompress

This application is meant to be used to compress your images and reduce them in size based on whatever application needs to serve them.

## Getting Started

```
git clone https://github.com/abel30567/localjscompress.git

cd localjscompress

npm install
```
Update the `constants.js` file with your desired values. Then run:

```
node compress
```

## Creating Optimal Constants file
This was made with the following thought process:
1. Jimp is good at resizing images and can compress images as well
2. Imagemin is better at compressing images than Jimp
3. You must know the max size of image width in pixels that you are trying to optimize image size for
4. You must know the max file size you are willing to cut off compression for.
5. You don't mind having images resized based on different file size rules.
6. This is meant to be used for your local image folder. Feel free to edit the code to have your images be compressed however you feel is best.
7. Follow the constants and how they are named.

## Image Resizing
This application will resize to two different widths:
- `RESIZE_IMAGE_WIDTH`- This width is the width you want to optimize for. You should expect all of your images to be of this pixel width.

- `RESIZE_HD_IMAGE_WIDTH` - This width is the width you don't mind lowering image width dimension size for, it will typically be less than `RESIZE_IMAGE_WIDTH` width. 

This use case will handle HD images of dimensional width less than your specified `MEDIAN_HD_IMAGE_WIDTH` and that are over `MAX_HD_IMAGE_SIZE` file size. In other words, these images are high quality images near the `RESIZE_IMAGE_WIDTH` width.

## Image File Sizes
This application uses two different file sizes for its logic:
- `MAX_HD_IMAGE_SIZE` - Is the Max value of the image file size in bytes that an image can have that is less than `MEDIAN_HD_IMAGE_WIDTH` dimensional width.
- `MAX_IMAGE_SIZE` - The Max size an image file can have that is of dimensional width from `RESIZE_HD_IMAGE_WIDTH` to `RESIZE_IMAGE_WIDTH`.

## Working Directories
This application uses three different directories for it to work from. Be sure that they exist before running the application:
- `ROOT` - This is the folder path for where the raw images are that you want to compress.
- `TEMP` - The application uses Jimp to resize and Imagemin to compress for optimal image file size reduction. When Jimp resizes these images they need to be written in a temporary location that Imagemin will later use to compress and write to `OUTPUT`.
- `OUTPUT`  - This is the output directory where you expect the compressed images to be written to. 

### Sample constants
```javascript 
// can be found in constants.js

module.exports = {
  ROOT: '../PATH_TO_SOURCE_TO_COMPRESS',
  TEMP: './TEMPORARY_DIRECTORY',
  OUTPUT: '../DIRECTORY_TO_WRITE_COMPRESSED_IMAGES_TO',
  RESIZE_IMAGE_WIDTH: 600,
  JIMP_QUALITY: 70,
  MAX_IMAGE_SIZE: 350000, // IN BYTES 350 KB
  RESIZE_HD_IMAGE_WIDTH: 400,
  MEDIAN_HD_IMAGE_WIDTH: 700,
  MAX_HD_IMAGE_SIZE: 650000
}
```
In this sample the optimal image size is 600px but we don't mind resizing images to 400px if they are high quality images greater than 650kB of file size and up to 700px. The Max file size we want for the images from 400px-600px is 350 kB.