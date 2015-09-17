(function() {
  'use strict';

  global.helper = {};

  /**
   * Parsed JSON schemas
   */
  helper.parsed = {};

  /**
   * Dereferenced JSON schemas
   */
  helper.dereferenced = {};

  /**
   * Bundled JSON schemas
   */
  helper.bundled = {};

  /**
   * Returns a function that throws an error if called.
   *
   * @param {function} done
   */
  helper.shouldNotGetCalled = function shouldNotGetCalled(done) {
    return function shouldNotGetCalledFN(err) {
      if (!(err instanceof Error)) {
        err = new Error('This function should not have gotten called.');
      }
      done(err);
    };
  };

  /**
   * Tests the {@link $RefParser.resolve} method,
   * and asserts that the given file paths resolve to the given values.
   *
   * @param {string} filePath - The file path that should be resolved
   * @param {*} resolvedValue - The resolved value of the file
   * @param {...*} [params] - Additional file paths and resolved values
   * @returns {Function}
   */
  helper.testResolve = function testResolve(filePath, resolvedValue, params) {
    var schemaFile = path.rel(arguments[0]);
    var parsedSchema = arguments[1];
    var expectedFiles = [], expectedValues = [];
    for (var i = 0; i < arguments.length; i++) {
      expectedFiles.push(path.abs(arguments[i]));
      expectedValues.push(arguments[++i]);
    }

    return function(done) {
      var parser = new $RefParser();
      parser
        .resolve(schemaFile)
        .then(function($refs) {
          expect(parser.schema).to.deep.equal(parsedSchema);
          expect(parser.$refs).to.equal($refs);

          // Resolved file paths
          expect($refs.paths()).to.have.same.members(expectedFiles);
          if (userAgent.isNode) {
            expect($refs.paths(['fs'])).to.have.same.members(expectedFiles);
            expect($refs.paths('http', 'https')).to.be.an('array').with.lengthOf(0);
          }
          else {
            expect($refs.paths(['http', 'https'])).to.have.same.members(expectedFiles);
            expect($refs.paths('fs')).to.be.an('array').with.lengthOf(0);
          }

          // Resolved values
          var values = $refs.values();
          expect(values).to.have.keys(expectedFiles);
          expectedFiles.forEach(function(file, i) {
            expect(values[file]).to.deep.equal(expectedValues[i], file);
          });

          done();
        })
        .catch(helper.shouldNotGetCalled(done));
    }
  };

})();
