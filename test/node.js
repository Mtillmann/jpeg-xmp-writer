import { readFileSync } from 'fs'
import { DOMParser } from '@xmldom/xmldom'
import { writeXmp } from '../jpeg-xmp-writer.js'

const originalBuffer = readFileSync('./test/test.jpg')

const xmpedBuffer = writeXMP(originalBuffer, { "xmp:Label": "Rot" });

console.log(xmpedBuffer)