// Include packages needed for this application
const inquirer = require('inquirer')
const db = require('./db/connection');
const cTable = require('console.table');

// Start DB connection and display welcome screen
db.connect(err => {
    if (err) throw err;
    console.clear();
    console.log(`====================================================================================`);
    console.log(``);
    console.log(`                            Welcome to the Employee CMS`);
    console.log(``);
    console.log(`====================================================================================`);
    promptMainMenu();
});

// Prompt the user for what action they want to take
const promptMainMenu = () => {
    inquirer.prompt([
        {
            type: 'rawlist',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add an employee',
                'Add a role',
                'Update an employee role',
                'View total utilized department budget',
                'Clear the screen',
                'Exit',
                new inquirer.Separator()
            ]
        }
    ])
        .then(response => {
            if (response.action == 'View all departments') {
                viewAllDepartments()
            }

            if (response.action == 'View all roles') {
                viewAllRoles()
            }

            if (response.action == 'View all employees') {
                viewAllEmployees()
            }

            if (response.action == 'Add a department') {
                addDepartment()
            }

            if (response.action == 'Add a role') {
                addRole()
            }

            if (response.action == 'Add an employee') {
                addEmployee()
            }

            if (response.action == 'Update an employee role') {
                updateEmployeeRole()
            }

            if (response.action == 'View total utilized department budget') {
                viewTotalUtilizedDeptBudget()
            }

            if (response.action == 'Clear the screen') {
                console.clear()
                promptMainMenu()
            }

            if (response.action == 'Exit') {
                console.log("Goodbye")
                process.exit(0)
            }
        })
}

const viewAllDepartments = () => {
    db.query(`SELECT name AS 'Dept Name', id AS 'Dept ID' FROM department`, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log(`====================================================================================`)
        console.log(`                          Viewing All Departments`)
        console.log(`====================================================================================`)
        console.log(``)
        console.log(`${cTable.getTable(rows)}`)
        console.log(`====================================================================================`)
        promptMainMenu()
    })
}

const viewAllRoles = () => {
    const sql = `SELECT role.title AS 'Job Title', role.id AS 'Role ID', department.name AS 'Dept Name', role.salary AS Salary
                FROM role
                LEFT JOIN department ON role.department_id = department.id
                ORDER BY title`
    db.query(sql, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log(`====================================================================================`)
        console.log(`                            Viewing All Roles`)
        console.log(`====================================================================================`)
        console.log(``)
        console.log(`${cTable.getTable(rows)}`)
        console.log(`====================================================================================`)
        promptMainMenu()
    })
}

const viewAllEmployees = () => {
    const sql = `SELECT
                employee.id AS 'Employee ID', 
                    CONCAT (employee.first_name, " ", employee.last_name) AS 'Employee Name',
                    role.title AS 'Job Title', 
                    role.salary AS 'Salary', 
                    CONCAT (manager.first_name, " ", manager.last_name) AS 'Manager Name'
                FROM employee
                LEFT JOIN employee manager ON employee.manager_id = manager.id
                LEFT JOIN role ON employee.role_id = role.id`
    db.query(sql, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log(`====================================================================================`)
        console.log(`                            Viewing All Employees`)
        console.log(`====================================================================================`)
        console.log(``)
        console.log(`${cTable.getTable(rows)}`)
        console.log(`====================================================================================`)
        promptMainMenu()
    })
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'deptName',
            message: 'What is the new department name?',
            validate: deptName => {
                if (!deptName || deptName.length > 30) {
                    console.log(`\nDepartment name is required and must be less than 30 characters.`)
                    return false
                } else {
                    return true
                }
            }
        }
    ]).then(params => {
        db.query(`INSERT INTO department (name) VALUES (?)`, params.deptName, (err, rows) => {
            if (err) { throw (err.message) }
            console.log(`====================================================================================`)
            console.log(`                   Department successfully added to database.`)
            console.log(`====================================================================================`)
            promptMainMenu()
        })
    })
}

async function addRole() {
    // ask the first two questions and save the responses to params
    let params = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the new role title?',
            validate: deptName => {
                if (!deptName || deptName.length > 30) {
                    console.log(`\nRole title is required and must be less than 30 characters.`)
                    return false
                } else {
                    return true
                }
            }
        },
        {
            type: 'number',
            name: 'salary',
            message: 'What is the new role salary?',
            validate: deptName => {
                if (!deptName || deptName.length > 65) {
                    console.log(`\nSalary is required and must be in decimal format and less than 65 characters.`)
                    return false
                } else {
                    return true
                }
            }
        }
    ])
    // get all the department names from the database, then ask the user to pick from them
    // inquirer choices require an array of objects with "name" property and return the "value" property, so using aliases in the DB query
    let deptChoices = await db.promise().query(`SELECT name, id as value FROM department`)
    //promise().query() returns an array of 2 objects. The first object contains the results of the query, so using [0]
    params = {
        ...params, ...await inquirer.prompt([
            {
                type: 'list',
                name: 'dept',
                message: 'What is the new role department?',
                choices: deptChoices[0]
            }
        ])
    }
    // finally, insert the new role into the database
    db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
        [params.title, params.salary, params.dept], (err, rows) => {
            if (err) { throw (err.message) }
            console.log(`====================================================================================`)
            console.log(`                      Role successfully added to database.`)
            console.log(`====================================================================================`)
            promptMainMenu()
        })
}

async function addEmployee() {
    // ask the first two questions and save the responses to params
    let params = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstname',
            message: 'What is the new employee\'s first name?',
            validate: firstname => {
                if (!firstname || firstname.length > 30) {
                    console.log(`\nFirst name is required and must be less than 30 characters.`)
                    return false
                } else {
                    return true
                }
            }
        },
        {
            type: 'input',
            name: 'lastname',
            message: 'What is the new employee\'s last name?',
            validate: lastname => {
                if (!lastname || lastname.length > 30) {
                    console.log(`\nLast name is required and must be less than 30 characters.`)
                    return false
                } else {
                    return true
                }
            }
        }
    ])
    // get all the roles from the database, then ask the user to pick from them
    // inquirer choices require an array of objects with "name" property and return the "value" property, so using aliases in the DB query
    let roleChoices = await db.promise().query(`SELECT id as value, title as name FROM role`)
    // promise().query() returns an array of 2 objects. The first object contains the results of the query, so using [0]
    params = {
        ...params, ... await inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: 'What is the new employee\'s role?',
                choices: roleChoices[0]
            }
        ])
    }
    // now we need to get the manager for the new employee
    // inquirer choices require an array of objects with "name" property and return the "value" property, so using aliases in the DB query
    let mgrChoices = await db.promise().query(`SELECT CONCAT (first_name, " ", last_name) AS name, id as value FROM employee`)
    // promise().query() returns an array of 2 objects. The first object contains the results of the query, so using [0]
    params = {
        ...params, ... await inquirer.prompt([
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: mgrChoices[0]
            }
        ])
    }
    // finally, insert new employee into database
    db.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
        [params.firstname, params.lastname, params.role, params.manager], (err, rows) => {
            if (err) { console.log(err.message) }
            console.log(`====================================================================================`)
            console.log(`                      Employee successfully added to database.`)
            console.log(`====================================================================================`)
            promptMainMenu()
        })
}

async function updateEmployeeRole() {
    // get all the employees from the database to use as choices
    let empChoices = await db.promise().query(`SELECT CONCAT (first_name, " ", last_name) AS name, id as value FROM employee`)
    // promise().query() returns an array of 2 objects. The first object contains the results of the query, so using [0]
    // ask for the employee and save the responses to params
    let params = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Who is the employee to be updated?",
            choices: empChoices[0]
        }
    ])
    // get all the roles from the database, then ask the user to pick from them
    // inquirer will display an array of objects with "name" properties and return the "value" property
    let roleChoices = await db.promise().query(`SELECT id as value, title as name FROM role`)
    params = {
        ...params, ...await inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: 'What is the employee\'s new role?',
                choices: roleChoices[0]
            }
        ])
    }
    db.query(`UPDATE employee SET role_id = ? WHERE id = ?`,
        [params.role, params.employee], (err, rows) => {
            if (err) { console.log(err.message) }
            console.log(`====================================================================================`)
            console.log(`                      Employee successfully updated.`)
            console.log(`====================================================================================`)
            promptMainMenu()
        })
}

async function viewTotalUtilizedDeptBudget() {
    // get all the department names from the database, then ask the user to pick from them
    // inquirer will display an array of objects with "name" properties and return the "value" property
    let deptChoices = await db.promise().query(`SELECT name, id as value FROM department`)
    // promise().query() returns an array of 2 objects. The first object contains the results of the query, so using [0]
    let params = await inquirer.prompt([
        {
            type: 'list',
            name: 'deptId',
            message: 'Which department would you like to see?',
            choices: deptChoices[0]
        }
    ])
    // run the report
    const sql = `
                SELECT department.name AS 'Department Name', SUM(role.salary) AS 'Utilized Budget'
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                WHERE department.id = ?`
    db.query(sql, params.deptId, (err, rows) => {
        if (err) { throw (err.message) }
        console.log(`====================================================================================`)
        console.log(`                      Viewing Total Utilized Department Budget`)
        console.log(`====================================================================================`)
        console.log(``)
        if (rows[0]['Utilized Budget'] == null) {
            console.log(`No employees in this department!`)
            console.log(``)
        } else {
            console.log(`${cTable.getTable(rows)}`)
        }
        console.log(`====================================================================================`)
        promptMainMenu()
    })
}


