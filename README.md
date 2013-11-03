# Triple representation benchmark

This benchmark examines the performance and memory usage of different triple representations,
as [discussed](http://lists.w3.org/Archives/Public/public-rdfjs/2013Nov/0000.html) on the RDF-JS mailing list.

## Tests
Currently, there are 8 tests, which compare the difference between [prototype-based representations](http://www.w3.org/TR/rdf-interfaces/) and [object/string-based representations](https://github.com/RubenVerborgh/node-n3#representing-uris-and-literals):

1. Generate prototype-based triples
2. Generate object/string-based triples
3. Find prototype-based triples with a given subject
4. Find object/string-based triples with a given subject
5. Find prototype-based triples with a given object
6. Find object/string-based triples with a given object
7. Check prototype-based triples for literals
8. Check object/string-based triples for literals

## Running the benchmark
- Install [Node](http://nodejs.org/)
- `./benchmark 3` where `3` is the test number

## Current results
As measured on a mid-2010 MacBook Pro:

<table>
<tr><td>0.</td><td>Empty test environment</td><td align="right">0.012s</td><td align="right">164MB</td></tr>
<tr><td>1.</td><td>Generate prototype-based triples</td><td align="right">12.692s</td><td align="right">1241MB</td></tr>
<tr><td>2.</td><td>Generate object/string-based triples</td><td align="right">4.867s</td><td align="right">803MB</td></tr>
<tr><td>3.</td><td>Find prototype-based triples with a given subject</td><td align="right">18.848s</td><td align="right">1241MB</td></tr>
<tr><td>4.</td><td>Find object/string-based triples with a given subject</td><td align="right">9.505s</td><td align="right">804MB</td></tr>
<tr><td>5.</td><td>Find prototype-based triples with a given object</td><td align="right">20.467s</td><td align="right">1241MB</td></tr>
<tr><td>6.</td><td>Find object/string-based triples with a given object</td><td align="right">10.571s</td><td align="right">819MB</td></tr>
<tr><td>7.</td><td>Check prototype-based triples for literals</td><td align="right">17.149s</td><td align="right">1303MB</td></tr>
<tr><td>8.</td><td>Check object/string-based triples for literals</td><td align="right">8.559s</td><td align="right">1028MB</td></tr>
</table>

### Analysis
Object/string-based representations are faster and use less memory in all tests.

- For triple generation, this does not come as a surprise.
Extra structure brings overhead, in terms of performance and memory.
- For finding triples with a given subject, only string comparisons are needed in both cases.
Yet, prototype-based representations require an extra level of indirection,
as the URI value is encoded in a property.
- For finding triples with a given object,
the prototype-based version has to rely on a polymorphic function that is different for URIs and literals.
The object/string-based version only needs string comparisons.
- For checking whether a triple has URI or literal for object,
it might seem surprising that object/string-based representations are faster,
since we need to inspect the string value to answer the question.
However, the `instanceof` check needed by the prototype-based version is even slower,
and the fact that there need to be different [hidden classes](https://developers.google.com/v8/design#prop_access)
for both `Triple` and `Literal` slows this down even further.
