import { readFileSync, writeFileSync } from 'fs'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { writeXMP } from '../jpeg-xmp-writer.js'
import crypto from 'crypto'

const originalBuffer = readFileSync('./test/test.jpg')
const arrayBuffer = new Uint8Array(originalBuffer).buffer

const xmpedArrayBuffer = writeXMP(arrayBuffer, { 'xmp:Title': 'Written by Node :)' }, DOMParser, new XMLSerializer().serializeToString, crypto)

const outBuffer = Buffer.from(xmpedArrayBuffer)
writeFileSync('./test/test-out.jpg', outBuffer)
