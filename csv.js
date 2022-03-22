const fs = require("fs");
const fastcsv = require("fast-csv");
const Pool = require("pg").Pool;

let stream_question = fs.createReadStream('csv_data/Questions.csv');
let stream_testcase = fs.createReadStream("csv_data/Testcases.csv");
let stream_initcode = fs.createReadStream("csv_data/Init_code.csv");

let questions = [];
let testcases = [];
let initcodes = [];

const query_question = "INSERT INTO problem (question_id, question_title, problem, \
    input_format, output_format, explanation, \
    constraint_input, constraint_output, constraint_time, \
    sample_input, sample_output, _level) \
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) \
    ON CONFLICT (question_id) DO UPDATE SET \
        question_title=$2, problem=$3, \
        input_format=$4, output_format=$5, explanation=$6, \
        constraint_input=$7, constraint_output=$8, constraint_time=$9, \
        sample_input=$10, sample_output=$11, _level=$12";

const query_testcase = "INSERT INTO testcase (question_id, testcase_id, _input, _output) \
    VALUES ($1, $2, $3, $4) \
    ON CONFLICT (question_id, testcase_id) DO UPDATE SET _input=$3, _output=$4";

const query_initcode = "INSERT INTO init_code (question_id, _language, tle, \
    base_code, _function, _answer) VALUES ($1, $2, $3, $4, $5, $6) \
    ON CONFLICT (question_id, _language) DO UPDATE SET tle=$3, base_code=$4, _function=$5, _answer=$6";


// upload question table
let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        questions.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        questions.shift();
        // connect to the PostgreSQL database
        const pool = new Pool({
            host: "localhost",
            user: "postgres",
            database: "db_cybersoft_academy",
            password: "Ngocquy20",
            port: 5432
        });

        // save data
        pool.connect((err, client, done) => {
            if (err) throw err;
            try {
                questions.forEach(row => {
                    client.query(query_question, row, (err, res) => {
                        if (err) {
                            console.log(err.stack);
                        } else {
                            console.log("inserted " + res.rowCount + " row:", row);
                        }
                    });
                });
            } finally {
                done();
            }
        });
});

stream_question.pipe(csvStream);

// upload testcase table
csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        testcases.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        testcases.shift();
        // connect to the PostgreSQL database
        const pool = new Pool({
            host: "localhost",
            user: "postgres",
            database: "db_cybersoft_academy",
            password: "Ngocquy20",
            port: 5432
        });

        // save data
        pool.connect((err, client, done) => {
            if (err) throw err;
            try {
                testcases.forEach(row => {
                    client.query(query_testcase, row, (err, res) => {
                        if (err) {
                            console.log(err.stack);
                        } else {
                            console.log("inserted " + res.rowCount + " row:", row);
                        }
                    });
                });
            } finally {
                done();
            }
        });
});

stream_testcase.pipe(csvStream);


// upload question table
csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        initcodes.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        initcodes.shift();
        // connect to the PostgreSQL database
        const pool = new Pool({
            host: "localhost",
            user: "postgres",
            database: "db_cybersoft_academy",
            password: "Ngocquy20",
            port: 5432
        });

        // save data
        pool.connect((err, client, done) => {
            if (err) throw err;
            try {
                initcodes.forEach(row => {
                    client.query(query_initcode, row, (err, res) => {
                        if (err) {
                            console.log(err.stack);
                        } else {
                            console.log("inserted " + res.rowCount + " row:", row);
                        }
                    });
                });
            } finally {
                done();
            }
        });
});

stream_initcode.pipe(csvStream);

