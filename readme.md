# jpeg-xmp-writer

A very simple library to write XMP metadata to JPEG files in the browser **and node**. Based on [Simon Boddy's xmp-jpeg](https://github.com/bbsimonbb/xmp-jpeg/). 

## Installation

```bash
npm i install @mtillmann/jpeg-xmp-writer
```

## Basic Usage (Browser)

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
```

In the example above I set the `xmp:Title` attribute of the first (and only) `<rdf:Description>` element to "Hello, World!" and added a `<dc:creator>` element with the value "Martin".

Note that you can't use `querySelector` or `querySelectorAll` to find namespaced elements, use `getElementsByTagName()[0]` instead.

If you only want set attributes, use the attribute map option described above.

Next, I'll show you how to replace the entire XMP metadata DOM:

```javascript
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

It's pretty straightforward and the only thing to keep in mind is that your XML/DOM needs some element that wraps `<x:xmpmeta>`, in the example above it's simply called `<root>`. You also need to return that wrapping root node by returning `yourDOMObject.documentElement`.

## Working with Blobs

If your source image data is a Blob, use these one-liners to convert it to ArrayBuffer and back:

```javascript
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'

const originalBlob = new Blob(/*...*/)

// Blob -> ArrayBuffer
const arrayBuffer = await new Response(originalBlob).arrayBuffer()

// inject XMP metadata
const bufferWithXMP = writeXMP(arrayBuffer, {'xmp:Title': 'I was a Blob once!'})

// ArrayBuffer -> Blob
const blobWithXMP = new Blob([bufferWithXMP], { type: "image/jpeg" })
```

## Working with data URLs

If your source image data is a data URL, I've included two helper functions to convert to ArrayBuffer and back to data URL:

```javascript
import { writeXMP, arrayBufferToDataURL, dataURLToArrayBuffer } from '@mtillmann/jpeg-xmp-writer'

const originalDataURL = 'data:image/jpeg;base64,...'

// data URL -> ArrayBuffer
const arrayBuffer = dataURLToArrayBuffer(originalDataURL)

// inject XMP metadata
const bufferWithXMP = writeXMP(arrayBuffer, {'xmp:Title': 'I was a Data URL once!'})

// ArrayBuffer -> Data URL
const dataURLWithXMP = arrayBufferToDataURL(bufferWithXMP)
```

## Basic Usage (Node)

Since node lacks a native DomParser and has no global crypto object, you need install and additional dependency and pass a few extra arguments to the `writeXMP` function:

Install `@xmldom/xmldom`: 

```bash
npm i install @xmldom/xmldom
```

Then, in your script, run writeXMP like this:
  
```javascript
// for demo purposes
import { readFileSync, writeFileSync } from 'fs'

// import writeXMP and the necessary dependencies
import { writeXMP } from '@mtillmann/jpeg-xmp-writer'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import crypto from 'crypto'

// read the JPEG file and convert it to an ArrayBuffer
const originalBuffer = readFileSync('./test/test.jpg')
const arrayBuffer = new Uint8Array(originalBuffer).buffer

// Write XMP metadata to the JPEG, note the extra arguments
const xmpedArrayBuffer = writeXMP(arrayBuffer, { 'xmp:Title': 'Written by Node :)' }, DOMParser, new XMLSerializer().serializeToString, crypto)

// write the modified ArrayBuffer to a new file
const outBuffer = Buffer.from(xmpedArrayBuffer)
writeFileSync('./test/test-out.jpg', outBuffer)
```

The three extra arguments are:

- `Parser` - a constructable DOMParser object, thats somewhat compatible with the browser's DOMParser.  
- `serializer` - a function that serializes a DOM object to a string, I used `XMLSerializer::serializeToString` method from the `@xmldom/xmldom` package.  
- `crypto` - a crypto object that has a `getRandomValues` method, I used the node's built-in `crypto` module.