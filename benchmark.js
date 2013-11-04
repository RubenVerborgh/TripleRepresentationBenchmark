#! /usr/bin/env node --expose-gc
var seed = 1, tripleCount = 7000000, findCount = 10, tests = {};
var fromCharCode = String.fromCharCode;

/* Primitive RDF prototype chain */

function Node(value) {
  this.value = value;
}

function URI(value) {
  Node.call(this, value);
}
URI.prototype = new Node();
URI.prototype.equals = function (node) {
  return node instanceof URI && node.value === this.value;
};

function Literal(value, type, language) {
  Node.call(this, value);
  if (type)
    this.type = type;
  else if (language)
    this.language = language;
}
Literal.prototype = new Node();
Literal.prototype.equals = function (node) {
  return node instanceof Literal && node.value === this.value
                                 && node.language === this.language
                                 && node.type === this.type;
}

function Triple(subject, predicate, object) {
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
}

/* String-based literals */

function createLiteralString(value, type, language) {
  if (type)
    return '"' + value + '"^^<' + type + '>';
  else if (language)
    return '"' + value + '"@' + language;
  else
    return '"' + value + '"';
}


/* Random triple creation */

// Generate random URIs and Literals
var URIs = randomStrings(10000, 20, 40),
    literals = randomStrings(10000, 10, 100);

// Add types and languages to some literals
for (var i = 0; i < literals.length; i++) {
  var literal = literals[i] = { value: literals[i] };
  if (i % 3 === 1)
    literal.type = randomString(randInt(20, 40));
  else if (i % 3 === 2)
    literal.language = randomString(randInt(2, 5));
}

// Generate subjects, predicates, and objects
var subjects = new Array(tripleCount),
    predicates = new Array(tripleCount),
    objects = new Array(tripleCount);
for (i = 0; i < tripleCount; i++) {
  subjects[i] = URIs[randInt(0, URIs.length - 1)];
  predicates[i] = URIs[randInt(0, URIs.length - 1)];
  objects[i] = random() < .5 ? URIs[randInt(0, URIs.length - 1)] : literals[randInt(0, literals.length - 1)];
}


/* Tests */

// Memory comparison with empty test environment
test(0, 'Empty test environment', function () {} );

var prototypeTriples;
test(1, 'Generate prototype-based triples', function () {;
  executeTest(0);
  prototypeTriples = new Array(tripleCount);
  for (var i = 0; i < tripleCount; i++) {
    var object = objects[i];
    prototypeTriples[i] = new Triple(new URI(subjects[i]),
                                     new URI(predicates[i]),
                                     object.value ? new Literal(object.value, object.type && new URI(object.type), object.language) : new URI(object));
  }
});

var objectTriples;
test(2, 'Generate object/string-based triples', function () {
  executeTest(0);
  objectTriples = new Array(tripleCount);
  for (var i = 0; i < tripleCount; i++) {
    var object = objects[i];
    objectTriples[i] = { subject: subjects[i],
                          predicate: predicates[i],
                          object: object.value ? createLiteralString(object.value) : object }
  }
});

test(3, 'Find prototype-based triples with a given subject', function () {
  executeTest(1);
  for (var i = 0; i < findCount; i++) {
    var randomSubject = prototypeTriples[randInt(0, prototypeTriples.length - 1)].subject;
    var matches = prototypeTriples.filter(function (t) {
      return t.subject.value === randomSubject.value;
    });
  }
});

test(4, 'Find object/string-based triples with a given subject', function () {
  executeTest(2);
  for (var i = 0; i < findCount; i++) {
    var randomSubject = objectTriples[randInt(0, objectTriples.length - 1)].subject;
    var matches = objectTriples.filter(function (t) {
      return t.subject === randomSubject;
    });
  }
});

test(5, 'Find prototype-based triples with a given object', function () {
  executeTest(1);
  for (var i = 0; i < findCount; i++) {
    var randomObject = prototypeTriples[randInt(0, prototypeTriples.length - 1)].object;
    var matches = prototypeTriples.filter(function (t) {
      return t.object.equals(randomObject);
    });
  }
});

test(6, 'Find object/string-based triples with a given object', function () {
  executeTest(2);
  for (var i = 0; i < findCount; i++) {
    var randomObject = objectTriples[randInt(0, objectTriples.length - 1)].object;
    var matches = objectTriples.filter(function (t) {
      return t.object === randomObject;
    });
  }
});

test(7, 'Check prototype-based triples for literals', function () {
  executeTest(1);
  var matches = prototypeTriples.filter(function (t) {
    return t.object instanceof Literal;
  });
});

test(8, 'Check object/string-based triples for literals', function () {
  executeTest(2);
  var matches = objectTriples.filter(function (t) {
    return /^"/.test(t.object);
  });
});



/* Utility functions */

// Generates an array of random strings having a minimum and maximum length
function randomStrings(number, minLength, maxLength) {
  var strings = new Array(number);
  for (var i = 0; i < number; i ++)
    strings[i] = randomString(randInt(minLength, maxLength));
  return strings;
}

// Generates a random string of the given length
function randomString(length) {
  var chars = new Array(length);
  for (var i = 0; i < length; i++) {
    var char = randInt(0, 61);
    if (char <= 9)
      chars[i] = fromCharCode(48 + char);
    else if (char <= 35)
      chars[i] = fromCharCode(55 + char);
    else
      chars[i] = fromCharCode(61 + char);
  }
  return chars.join('');
}

// Generates a random integer between min and max (boundaries included)
function randInt(min, max) {
  return min + Math.floor((max - min + 1) * random());
}

// Generates a random number with a seed
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Executes a test if it is selected
function test(id, name, execute) {
  tests[id] = { name: name, test: execute };
  if (id == process.argv[2])
    executeTest(id);
}

// Executes a test
function executeTest(id) {
  global.gc();
  var startTime = process.hrtime();
  tests[id].test();
  var duration = process.hrtime(startTime);
  console.log(id + '. ' + tests[id].name + ': ' + (duration[0] + duration[1]/1000000000) + 's',
              Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB');
}
