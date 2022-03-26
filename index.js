// Include packages needed for this application
const inquirer = require('inquirer')
const db = require('./db/connection');
const cTable = require('console.table');

// Start DB connection and display welcome screen
db.connect(err => {
    if (err) throw err;
    console.clear();
    console.log((`====================================================================================`));
    console.log(``);
    console.log('                            Welcome to the Employee CMS');
    console.log(``);
    console.log((`====================================================================================`));
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
        console.log((`====================================================================================`))
        console.log(`                          Viewing All Departments`)
        console.log((`====================================================================================`))
        console.log("\n" + cTable.getTable(rows))
        console.log((`====================================================================================`))
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
        console.log((`====================================================================================`))
        console.log(`                            Viewing All Roles`)
        console.log((`====================================================================================`))
        console.log("\n" + cTable.getTable(rows))
        console.log((`====================================================================================`))
        promptMainMenu()
    })
}

const viewAllEmployees = () => {
    const sql = `SELECT 
                        employee.id as 'Employee ID', 
                        employee.first_name AS 'First Name', 
                        employee.last_name AS 'Last Name', 
                        role.title AS 'Job Title', 
                        role.salary AS 'Salary', 
                        employee.manager_id AS 'Manager Employee ID' 
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id`
    db.query(sql, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log((`====================================================================================`))
        console.log(`                            Viewing All Employees`)
        console.log((`====================================================================================`))
        console.log("\n" + cTable.getTable(rows))
        console.log((`====================================================================================`))
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
            console.log((`====================================================================================`))
            console.log(`                   Department successfully added to database.`)
            console.log((`====================================================================================`))
            promptMainMenu()
        })
    })
}

const addRole = () => {
    // create a params object to hold the responses to our questions through multiple inquirer prompts
    params = {}
    // ask the first two questions and save the responses to params
    inquirer.prompt([
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
    ]).then(responses => {
        params.title = responses.title
        params.salary = responses.salary
        //we need to get all the department names from the database, then ask the user to pick from them
        //inquirer will display an array of objects with "name" properties and return the "value" property
        const deptChoicesSql = `SELECT name, id as value FROM department`
        db.query(deptChoicesSql, (err, deptChoices) => {
            if (err) { throw (err.message) }
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: 'What is the new role department?',
                    choices: deptChoices
                }
            ]).then(responses => {
                params.dept = responses.dept
                // finally, insert the new role into the database
                const sql = `
                    INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`
                db.query(sql, [params.title, params.salary, params.dept], (err, rows) => {
                    if (err) { throw (err.message) }
                    console.log((`====================================================================================`))
                    console.log(`                      Role successfully added to database.`)
                    console.log((`====================================================================================`))
                    promptMainMenu()
                })
            })
        })
    })
}


const addEmployee = () => {
    // create a params object to hold the responses to our questions through multiple inquirer prompts
    params = {}
    // ask the first two questions and save the responses to params
    inquirer.prompt([
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
    ]).then(responses => {
        params.firstname = responses.firstname
        params.lastname = responses.lastname
        //we need to get all the roles from the database, then ask the user to pick from them
        //inquirer will display an array of objects with "name" properties and return the "value" property
        db.query(`SELECT id as value, title as name FROM role`, (err, roleChoices) => {
            if (err) { console.log(err.message) }
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the new employee\'s role?',
                    choices: roleChoices
                }
            ]).then(roleChoice => {
                params.role = roleChoice.role
                //now we need to get the manager for the new employee
                //inquirer will display an array of objects with "name" properties and return the "value" property
                db.query(`SELECT CONCAT (first_name, " ", last_name) AS name, id as value FROM employee`, (err, mgrChoices) => {
                    if (err) { console.log(err.message) }
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: mgrChoices
                        }
                    ]).then(managerChoice => {
                        params.manager = managerChoice.manager
                        db.query(
                            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
                            [params.firstname, params.lastname, params.role, params.manager], (err, rows) => {
                                if (err) { console.log(err.message) }
                                console.log((`====================================================================================`))
                                console.log(`                      Employee successfully added to database.`)
                                console.log((`====================================================================================`))
                                promptMainMenu()
                            })
                    })
                })
            })
        })
    })
}

const updateEmployeeRole = () => {
    db.query(`UPDATE employee SET role_id = ? WHERE id = ?`,
        [response.employeetoupdate, response.newemployeerole], (err, rows) => {
            if (err) { console.log(err.message) }
            console.log((`====================================================================================`))
            console.log(`                      Employee successfully added to database.`)
            console.log((`====================================================================================`))
            promptMainMenu()
        })
}

const viewTotalUtilizedDeptBudget = () => {
    console.log("Not yet supported")
    const sql = `
            SELECT department.name, SUM(role.salary)
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            WHERE department.name = 'Accounting'`
    promptMainMenu()
}


