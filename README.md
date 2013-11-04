# Triple representation benchmark

This benchmark examines the performance and memory usage of different triple representations,
as [discussed](http://lists.w3.org/Archives/Public/public-rdfjs/2013Nov/0000.html) on the RDF-JS mailing list.

## Tests
Currently, there are 8 tests, which compare the difference between [prototype-based representations](http://www.w3.org/TR/rdf-interfaces/) and [object/string-based representations](https://github.com/RubenVerborgh/node-n3#representing-uris-and-literals):

- gt1: Generate prototype-based triples
- gt2: Generate object/string-based triples
- fs1: Find prototype-based triples with a given subject
- fs2: Find object/string-based triples with a given subject
- fo1: Find prototype-based triples with a given object
- fo2: Find object/string-based triples with a given object
- cl1: Check prototype-based triples for literals
- cl2: Check object/string-based triples for literals

## Running the benchmark
- Install [Node](http://nodejs.org/)
- `./benchmark gt1` where `gt1` is the test identifier

## Current results
As measured on a mid-2010 MacBook Pro:

<table>
<tr><td>init</td><td>Empty test environment</td><td align="right">0.000s</td><td align="right">164MB</td></tr>
<tr><td>gt1</td><td>Generate prototype-based triples</td><td align="right">13.372s</td><td align="right">1241MB</td></tr>
<tr><td>gt2</td><td>Generate object/string-based triples</td><td align="right">5.078s</td><td align="right">803MB</td></tr>
<tr><td>fs1</td><td>Find prototype-based triples with a given subject</td><td align="right">61.593s</td><td align="right">1241MB</td></tr>
<tr><td>fs2</td><td>Find object/string-based triples with a given subject</td><td align="right">45.920s</td><td align="right">804MB</td></tr>
<tr><td>fo1</td><td>Find prototype-based triples with a given object</td><td align="right">78.883s</td><td align="right">1241MB</td></tr>
<tr><td>fo2</td><td>Find object/string-based triples with a given object</td><td align="right">56.719s</td><td align="right">819MB</td></tr>
<tr><td>cl1</td><td>Check prototype-based triples for literals</td><td align="right">0.997s</td><td align="right">1303MB</td></tr>
<tr><td>cl2</td><td>Check object/string-based triples for literals</td><td align="right">2.786s</td><td align="right">935MB</td></tr>
</table>

### Analysis
Object/string-based representations are faster, except for literal checks.
In all cases, they use less memory.

- For triple generation, this does not come as a surprise.
Extra structure brings overhead, in terms of performance and memory.
- For finding triples with a given subject, only string comparisons are needed in both cases.
Yet, prototype-based representations require an extra level of indirection,
as the URI value is encoded in a property.
- For finding triples with a given object,
the prototype-based version has to rely on a polymorphic function that is different for URIs and literals.
The object/string-based version only needs string comparisons.
- For checking whether a triple has URI or literal for object,
the prototype test is considerably faster than inspecting the first character of the string.
