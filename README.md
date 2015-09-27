# json5stream

[JSON5](http://json5.org/) is ([arguably](https://news.ycombinator.com/item?id=4031699)) awesome. 

Similar to [jsonstream](https://www.npmjs.com/package/jsonstream), this library is a wrapper around the JSON5.parse function to support streaming data into the parser.

#### Usage

```
$ npm install json5stream
```

```javascript
var json5stream = require( "json5stream" );

fs.createReadStream( "somefile.json5" )
  .pipe( json5stream() )
  .pipe( process.stdout );

```



