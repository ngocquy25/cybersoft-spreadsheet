const express = require("express");
const { google } = require("googleapis");
const { Client } = require('pg');


const query_question = "INSERT INTO problem (question_id, input_format, output_format, \
    sample_input, sample_output, _level) \
    VALUES ($1, $2, $3, $4, $5, $6) \
    ON CONFLICT (question_id) DO NOTHING";

const query_question_detail = "INSERT INTO problem_detail (question_id, locale, question_title, \
    problem, explanation, \
    constraint_input, constraint_output, constraint_time) \
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) \
    ON CONFLICT (question_id, locale) DO NOTHING";

const query_testcase = "INSERT INTO testcase (question_id, testcase_id, _input, _output) \
    VALUES ($1, $2, $3, $4) \
    ON CONFLICT (question_id, testcase_id) DO NOTHING";

const query_initcode = "INSERT INTO init_code (question_id, _language, tle, \
    base_code, _function, _answer) VALUES ($1, $2, $3, $4, $5, $6) \
    ON CONFLICT (question_id, _language) DO NOTHING";

const pool = new Client({
    user: 'rskcxehdjtxnnh',
    host: 'ec2-3-89-214-80.compute-1.amazonaws.com',
    database: 'd22obclk3e86pt',
    password: '3d3e378cf781a612ecb857dc75eec6c1f569df987e6b1d2088a0c1fdaee7943a',
    port: 5432,
    ssl: true,
    // host: "localhost",
    // user: "postgres",
    // database: "db_cybersoft_academy",
    // password: "Ngocquy20",
    // port: 5432
});
pool.connect();

const app = express();

app.use(express.urlencoded( {extended: true} ));
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

app.get("/", async (req, res) => {
    
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "11EcTOOezDppWS9mxjNt-fE7FoYkt3iqhXGRzPYRbjB0";

    // Get rows from Questions sheet
    const getRowQuestions = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Questions"
    });

    // Get rows from Questions_detail sheet
    const getRowQuestionsDetail = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Questions_detail"
    });

    // Get rows from Testcases sheet
    const getRowTestcases = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Testcases"
    });

    // Get rows from Init_code sheet
    const getRowInitcodes = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Init_code"
    });

    let questions = getRowQuestions.data.values;
    let questionsDetail = getRowQuestionsDetail.data.values;
    let testcases = getRowTestcases.data.values;
    let initcodes = getRowInitcodes.data.values;

    // remove the first row (header)
    questions.shift();
    questionsDetail.shift();
    testcases.shift();
    initcodes.shift();

    // upsert problem table on db
    let count = 1;
    questions.forEach(async (row, index, array) => {
        if (row.length > 1){
            if (row.length < 6) {
                for (let i = row.length; i<6; i++) {
                    row.push(null);
                }
            }
            await pool.query(query_question, row, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    console.log(row);
                } else {
                    console.log(`Questions row ${count++} is upserted!`);
                    if (index === array.length - 1) console.log('🤟 🤟 🤟 🤟 🤟 🤟');
                }
            });
        }
    });

    // upsert problem_detail table on db
    let count3 = 1;
    questionsDetail.forEach(async (row, index, array) => {
        if (row.length > 1){
            if (row.length < 8) {
                for (let i = row.length; i<8; i++) {
                    row.push(null);
                }
            }
            await pool.query(query_question_detail, row, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    console.log(row);
                } else {
                    console.log(`Questions_detail row ${count3++} is upserted!`);
                    if (index === array.length - 1) console.log('🤟 🤟 🤟 🤟 🤟 🤟');
                }
            });
        }
    });

    // upsert testcase table
    let count1 = 1;
    testcases.forEach(async (row, index, array) => {
        if (row.length > 1){
            if (row.length < 4) {
                for (let i = row.length; i<4; i++) {
                    row.push(null);
                }
            }
            await pool.query(query_testcase, row, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    console.log(row);
                } else {
                    console.log(`Testcases row ${count1++} is upserted!`);
                    if (index === array.length - 1) console.log('🤟 🤟 🤟 🤟 🤟 🤟');
                }
            });
        }
    });

    // upsert init_code table
    let count2 = 1;
    initcodes.forEach(async (row, index, array) => {
        if (row.length > 1){
            if (row.length < 6) {
                for (let i = row.length; i<6; i++) {
                    row.push(null);
                }
            }
            await pool.query(query_initcode, row, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    console.log(row);
                } else {
                    console.log(`Init_code row ${count2++} is upserted!`);
                    if (index === array.length - 1) console.log('🤟 🤟 🤟 🤟 🤟 🤟');
                }
            });
        }
    });
})

const PORT = process.env.PORT || 3001;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
app.listen(PORT, () => {
    console.warn(`App listening on http://localhost:${PORT}`);
});  


/* --------------------------------------------------------------------
-------------------------------------------------------------------- */

// const creds = require('./credentials.json');

// const client = new google.auth.JWT(
//     creds.client_email, 
//     null, 
//     creds.private_key, 
//     ['https://www.googleapis.com/auth/spreadsheets']
// );

// client.authorize(async (err, tokens) => {
//     if (err) {
//         console.log(err);
//         return;
//     } else {
//         console.log('Connected!');
//         gsrun(client);
//     }
// });

// const gsrun = async () => {
//     const googleSheets = google.sheets({ version: "v4", auth: client });
//     const spreadsheetId = "11EcTOOezDppWS9mxjNt-fE7FoYkt3iqhXGRzPYRbjB0";

//     // Get rows from Questions sheet
//     const getRowQuestions = await googleSheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Questions"
//     });

//     // Get rows from Testcases sheet
//     const getRowTestcases = await googleSheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Testcases"
//     });

//     // Get rows from Init_code sheet
//     const getRowInitcodes = await googleSheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Init_code"
//     });

//     let questions = getRowQuestions.data.values;
//     let testcases = getRowTestcases.data.values;
//     let initcodes = getRowInitcodes.data.values;

//     // remove the first row (header)
//     questions.shift();
//     testcases.shift();
//     initcodes.shift();

//     console.log(questions);
// }
