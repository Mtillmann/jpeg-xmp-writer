# jpeg-xmp-writer

A very simple library to write XMP metadata to JPEG files in the browser. Based on [Simon Boddy's xmp-jpeg](https://github.com/bbsimonbb/xmp-jpeg/). 

## Installation

```bash
npm i install @mtillmann/jpeg-xmp-writer
```

## Usage

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

const arrayBuffer = /*...*/ // your JPEG file as an ArrayBuffer

// Write XMP metadata to the JPEG
const xmpArrayBuffer = writeXMP(arrayBuffer, {'xmp:Title': 'Hello, World!'})
```

## Using Simple Attributes

The second argument to `writeXMP` can be an object with the XMP attributes you want to write. The keys are the XMP attribute names, and the values are the attribute values. [Here's an exhaustive list of XMP attributes](https://www.exiftool.org/TagNames/XMP.html). Note that the attribute names are case-sensitive and must be prefixed with `xmp:`.

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

const arrayBuffer = /*...*/ // your JPEG file as an ArrayBuffer

// Write common Lightroom (Classic) attributes to the JPEG
const xmpArrayBuffer = writeXMP(arrayBuffer, {'xmp:Label': 'Green', 'xmp:Rating': 3})
``` 

## Manipulating/Replacing the XMP Metadata DOM

The second argument also accepts a function that receives the XMP metadata DOM as an argument. This is useful if you want to manipulate the existing XMP metadata or replace it entirely.

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

const arrayBuffer = /*...*/ // your JPEG file as an ArrayBuffer

// manipulate the XMP metadata DOM
const xmpArrayBuffer = writeXMP(arrayBuffer, dom => {
  // use getElementsByTagName to find namespaced elements
  dom.getElementsByTagName('rdf:Description')[0].setAttribute('xmp:Title', 'Hello, World!')
  dom.getElementsByTagName('rdf:Description')[0].insertAdjacentHTML('beforeend', '<dc:creator><rdf:Seq><rdf:li>Martin</rdf:li></rdf:Seq></dc:creator>')
  return dom
})

// replace the XMP metadata DOM
const xmpArrayBuffer2 = writeXMP(arrayBuffer, dom => {
    // add a fake root node to the XMP metadata, because innerHTML is used to extract actual XML
  return (new DOMParser()).parseFromString(`<root><x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.5-c002 1.148022, 2012/07/15-18:06:45        ">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" 
            xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" 
            xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#"
            xmp:Label="Gelb"
            xmp:Rating="2"
            xmp:Title="I'm an Image yay">
        </rdf:Description>
    </rdf:RDF>
</x:xmpmeta></root>`, 'text/xml').documentElement // <- return the documentElement (<root>)
})

```

## Working with Blobs

If your source image data is a Blob, use these one-liners to convert it to array buffer and back:

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

const originalBlob = new Blob(/*...*/)

// Blob -> arrayBuffer
const arrayBuffer = await new Response(originalBlob).arrayBuffer()

// inject XMP metadata
const bufferWithXMP = writeXMP(arrayBuffer, {'xmp:Title': 'I was a Blob once!'})

// arrayBuffer -> Blob
const blobWithXMP = new Blob([bufferWithXMP], { type: "image/jpeg" })
```

## Working with data URLs

If your source image data is a data URL, I've included two helper functions to convert it to array buffer and back:

```javascript
import { writeXMP, arrayBufferToDataURL, dataURLToArrayBuffer } from '@mtillmann/jpeg-xmp-writer'

const originalDataURL = 'data:image/jpeg;base64,...'

// data URL -> arrayBuffer
const arrayBuffer = dataURLToArrayBuffer(originalDataURL)

// inject XMP metadata
const bufferWithXMP = writeXMP(arrayBuffer, {'xmp:Title': 'I was a Data URL once!'})

// arrayBuffer -> Data URL
const dataURLWithXMP = arrayBufferToDataURL(bufferWithXMP)
```