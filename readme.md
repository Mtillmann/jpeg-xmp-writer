# JPEG-XMP-WRITER

A very simple library to write XMP metadata to JPEG files in the browser.

## Installation

```bash
npm i install @mtillmann/jpeg-xmp-writer
```

## Usage

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

// Create a JPEG file blob
const canvas = document.createElement('canvas')
canvas.width = 100
canvas.height = 100
const ctx = canvas.getContext('2d')
ctx.beginPath()
ctx.fillStyle = 'red'
ctx.fillRect(0, 0, 100, 100)
ctx.closePath()

const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))

// Write XMP metadata to the JPEG blob

writeXMP(blob, )

```

## Working with Blobs

If your source image data is a blob, use these one-liners to convert it to a an array buffer and back:

```javascript

const arrayBuffer = await new Response(originalBlob).arrayBuffer();

const bufferWithXMP = writeXMP(arrayBuffer, {'xmp:Title': 'I was a blob once!'});

const blobWithXMP = new Blob([bufferWithXMP], { type: "image/jpeg" });

```

## Working with Data URLs