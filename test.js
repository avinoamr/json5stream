var assert = require( "assert" )
var json5stream = require( "./index" );

it( "parses a single whole object", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ { hello: "world" } ] )
            done();
        })
        .end( '{hello:"world"}' )
})

it( "parses a condensed list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])
            done();
        })
        .end( '{hello:"world"}{foo:"bar"}' )
});

it( "parses a whitespace-separated list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])
            done();
        })
        .end( '{hello:"world"}    {foo:"bar"}' )
});

it( "parses a newline-separated list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])
            done();
        })
        .end( '{hello:"world"}\n\n{foo:"bar"}' )
});

it( "parses a tab-separated list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])
            done();
        })
        .end( '{hello:"world"}\t\t{foo:"bar"}' )
});

it( "parses a comma-separated list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])
            done();
        })
        .end( '{hello:"world"},{foo:"bar"}' )
});

it( "parses nested lists", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                [ 1, 2 ],
                [ 3, 4 ]
            ])
            done();
        })
        .end( '[1,2][3,4]' )
});

it( "disregards encapsulating list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( results, [ 
                [ { hello: "world" }, { foo: "bar" } ],
                [ { hello: "world" }, { foo: "bar" } ],
            ])
            done();
        })
        .end( '[{hello:"world"},\n{foo:"bar"}][{hello:"world"},\n{foo:"bar"}]' )
})

it( "streams partial data", function ( done ) {
    var results = [], partial;
    var stream = json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "end", function () {
            assert.deepEqual( partial, [
                { hello: "world" },
            ])

            assert.deepEqual( results, [ 
                { hello: "world" },
                { foo: "bar" },
            ])

            done();
        })
    
    stream.write( '{hello:"world"},{f' );
    stream.write( 'oo:"bar"' );
    
    // only the first object is parsable thus far
    // copy the array for asserting on end
    partial = results.slice();

    stream.end( "}" );

});

it( "fails on malformed list", function ( done ) {
    var results = []
    json5stream()
        .on( "data", results.push.bind( results ) )
        .on( "error", function ( err ) {
            assert( err.toString().match( /SyntaxError/ ) )
            done();
        })
        .end( '[1,2][3,4' )
});

it( "fails on buffer too big", function ( done ) {
    var results = []
    var stream = json5stream({ maxBufferSize: 5 })
        .on( "error", function ( err ) {
            assert( err.toString().match( /BufferTooBigError/ ) )
            assert( err.buffer instanceof Buffer );
            assert.equal( err.buffer.toString(), '{hello:"world foo bar' )
            assert.equal( err.maxBufferSize, 5 );
            done();
        })

    stream.write( '{hello:"world foo bar' );
    stream.end( '"}')
});
