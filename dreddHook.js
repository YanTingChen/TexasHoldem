var hooks = require('hooks');
/**
 * transactions = {
 *      https://dredd.readthedocs.io/en/latest/data-structures.html#transaction-object
 *      id: GET (200) /greetings - identifier for this transaction
        name: ./api-description.apib > My API > Greetings > Hello, world! > Retrieve Message > Example 2 (string) - reference to the transaction definition in the original API description document (see also Dredd Transactions)
        origin (object) - reference to the transaction definition in the original API description document (see also Dredd Transactions)
        filename: ./api-description.apib (string)
        apiName: My Api (string)
        resourceGroupName: Greetings (string)
        resourceName: Hello, world! (string)
        actionName: Retrieve Message (string)
        exampleName: Example 2 (string)
        host: 127.0.0.1 (string) - server hostname without port number
        port: 3100 (number) - server port number
        protocol: https: (enum[string]) - server protocol
        https: (string)
        http: (string)
        fullPath: /message (string) - expanded URI Template with parameters (if any) used for the HTTP request Dredd performs to the tested server
        request (object) - the HTTP request Dredd performs to the tested server, taken from the API description
            body: Hello world!\n (string)
            headers (object) - keys are HTTP header names, values are HTTP header contents
            uri: /message (string) - request URI as it was written in API description
            method: POST (string)
        expected (object) - the HTTP response Dredd expects to get from the tested server
            statusCode: 200 (string)
            headers (object) - keys are HTTP header names, values are HTTP header contents
            body (string)
            bodySchema (object) - JSON Schema of the response body
        real (object) - the HTTP response Dredd gets from the tested server (present only in after hooks)
            statusCode: 200 (string)
            headers (object) - keys are HTTP header names, values are HTTP header contents
            body (string)
        skip: false (boolean) - can be set to true and the transaction will be skipped
        fail: false (enum) - can be set to true or string and the transaction will fail
        (string) - failure message with details why the transaction failed
        (boolean)
        test (Transaction Test) - test data passed to Dredd’s reporters
        results (Transaction Results) - testing results
 *      Test: {
 *          https://dredd.readthedocs.io/en/latest/data-structures.html#transaction-test
 *          start (Date) - start of the test
            end (Date) - end of the test
            duration (number) - duration of the test in milliseconds
            startedAt (number) - unix timestamp, transaction.startedAt
            title (string) - transaction.id
            request (object) - transaction.request
            actual (object) - transaction.real
            expected (object) - transaction.expected
            status (enum) - whether the validation passed or not, defaults to empty string
            pass (string)
            fail (string)
            skip (string)
            message (string) - concatenation of all messages from all Gavel Errors in results or Dredd’s custom message (e.g. “failed in before hook”)
            results (Dredd’s transaction.results)
            valid (boolean)
            origin (object) - transaction.origin
 *      },
 *      Results: {
 *          https://dredd.readthedocs.io/en/latest/data-structures.html#transaction-results-object
 *          statusCode (Gavel Validator Output)
            headers (Gavel Validator Output)
            body (Gavel Validator Output)
            version (string) - version number of the Gavel Validation Result structure
 *      },
 * }
*/

hooks.beforeAll(function (transactions, done) {
    hooks.log('before all');
    done();
});

hooks.beforeEach(function (transaction, done) {
    var paramToAdd = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmlja05hbWUiOiJUb20gQ3J1aXNlIiwicmVhbE5hbWUiOiJUaG9tYXMgQ3J1aXNlIE1hcG90aGVyIElWIiwibGFzdExvZ2luVGltZSI6IjIwMTgtMDktMTRUMDI6NDk6MTkuMDAwWiIsImlhdCI6MTUzNjg5MzMxNSwiZXhwIjo3ODQ4NDEzMzE1fQ.Pp-5wAP0YES-5N2xwaKTJJOJRwMgJAtZJkpaXlkqadY"
    transaction.request.headers['Authorization'] = paramToAdd;
    done();
});

hooks.before("Machines > Machines collection > Get Machines", function (transaction, done) {
    hooks.log("before");
    done();
});

hooks.beforeEachValidation(function (transaction, done) {
    hooks.log('before each validation');
    done();
});

hooks.beforeValidation("Machines > Machines collection > Get Machines", function (transaction, done) {
    hooks.log("before validation");
    done();
});

hooks.after("Machines > Machines collection > Get Machines", function (transaction, done) {
    hooks.log("after");
    done();
});

hooks.afterEach(function (transaction, done) {
    hooks.log('after each');
    done();
});

hooks.afterAll(function (transactions, done) {
    hooks.log('after all');
    done();
})