# json5stream

Streaming json5 parsing

> [JSON5](http://json5.org/) is awesome! <br />Actually, [some may disagree](https://news.ycombinator.com/item?id=4031699).

Similar to [jsonstream](https://www.npmjs.com/package/jsonstream), this library is a wrapper around the JSON5.parse function to support streaming data into the parser.

#### Usage

```
$ npm install json5stream
```

```javascript
var json5stream = require( "json5stream" );

fs.createReadStream( "somefile.json5" )
  .pipe( json5stream() )
  .on( "data", function ( d ) {
      // do something with it.
  });

```
