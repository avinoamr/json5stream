var stream = require( "stream" );
var json5 = require( "json5" );
var util = require( "util" );

module.exports = json5stream;
module.exports.Stream = Stream;

var MAX_BUFFER_SIZE = 1048576; // 1mib

function json5stream ( options ) {
    return new Stream( options );
}

util.inherits( Stream, stream.Transform );
function Stream( options ) {
    options || ( options = {} );
    options.readableObjectMode = true;

    stream.Transform.call( this, options )
    this.maxBufferSize = options.maxBufferSize || MAX_BUFFER_SIZE;

    this.buf = new Buffer( "" );
    this.count = 0;
}

Stream.prototype._flush = function ( done ) {
    if ( this.buf.length ) {
        try {
            json5.parse( this.buf );
        } catch ( err ) {
            return done( err )
        }
    }
    
    done();
}

Stream.prototype._transform = function ( data, enc, done ) {
    var objects;

    // prepend the left-over characters from the previous iteration
    data = Buffer.concat( [ this.buf, data ] );

    // parse the internal objects with json5
    try {
        objects = this._parse( data );
    } catch ( err ) {
        return done( err );
    }
    

    // keep all of the remaining characters that for the next iteration 
    // append the exterior brackets that were trimmed earlier
    this.buf = objects.remaining;

    // push all of the parsed objects
    objects.forEach(function ( obj ) {
        this.count += 1;
        this.push( obj );
    }.bind( this ) );

    if ( this.buf.length > this.maxBufferSize ) {
        return done( new BufferTooBigError( this.buf, this.maxBufferSize ) )
    }

    done();
}


Stream.prototype._parse = function ( data ) {
    var results = [], start, stack, i, ichar, d, obj;

    // separate internal objects by comma or whitespace and parse them
    // individually with json5
    start = 0;
    stack = [];
    for ( i = 0 ; i < data.length ; i += 1 ) {
        ichar = data.toString( "utf8", i, i + 1 );
        if ( ichar == "{" ) {
            stack.push( "}" )
        } else if ( ichar == "[" ) {
            stack.push( "]" )
        } else if ( stack[ stack.length - 1 ] == ichar ) {
            stack.pop();
        }

        if ( stack.length == 0 && ichar.match( /[\s|,]/ ) ) {
            // skip whitespace and commands in-between items
            start = i + 1;
        } else if ( stack.length == 0 ) {
            d = data.slice( start, i + 1 )
            obj = json5.parse( d );
            results.push( obj );
            start = i + 1;
        }
    }

    // keep all of the excessive characters that did not complete an 
    // object
    results.remaining = data.slice( start );

    return results;
}

function trimLeft( buffer, regex ) {
    var i, ichar;
    for ( i = 0 ; i < buffer.length ; i += 1 ) {
        var ichar = buffer.toString( "utf8", i, i + 1 );
        if ( !ichar.match( regex ) ) {
            break;
        }
    }

    if ( i > 0 ) {
        var trimmed = buffer.slice( 0, i );
        buffer = buffer.slice( i );
        buffer.trimmed = trimmed;
        console.log( i, buffer.trimmed.toString(), buffer.toString() )
    }

    return buffer;
}


util.inherits( BufferTooBigError, Error );
function BufferTooBigError( buf, max ) {
    this.name = "BufferTooBigError";
    this.maxBufferSize = max;
    this.buffer = buf;
    this.message = [
        "Buffer size exceeds the maximum size",
        "of", max, "bytes per single object in the stream.",
        "To remove this error, set a different maxBufferSize"
    ].join( " " );
}

