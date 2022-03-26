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
    const sql = `
                SELECT name AS 'Dept Name', id AS 'Dept ID' FROM department`
    db.query(sql, (err, rows) => {
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
    const sql = `
                SELECT role.title AS 'Job Title', role.id AS 'Role ID', department.name AS 'Dept Name', role.salary AS Salary
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
    const sql = `
                SELECT 
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
        const sql = `
                    INSERT INTO department (name) VALUES (?)`
        db.query(sql, params.deptName, (err, rows) => {
            if (err) { throw (err.message) }
            console.log((`====================================================================================`))
            console.log(`                   Department successfully added to database.`)
            console.log((`====================================================================================`))
            promptMainMenu()
        })
    })
}

const addRole = () => {
    const sql = `
                INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`
    params = [response.role, response.salary, response.department]
    //TODO: Add input validation

    db.query(sql, params, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log((`====================================================================================`))
        console.log(`                      Role successfully added to database.`)
        console.log((`====================================================================================`))
        promptMainMenu()
    })

}

const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstname',
            message: 'What is the new employee\'s first name?',
            validate: firstname => {
                if (firstname) {
                    return true;
                } else {
                    console.log('Please enter a first name!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastname',
            message: 'What is the new employee\'s last name?',
            validate: lastname => {
                if (lastname) {
                    return true;
                } else {
                    console.log('Please enter a last name!');
                    return false;
                }
            }
        }
    ]).then(response => {
        const params = [response.firstname, response.lastname]
        const getRolesSql = `SELECT id, title FROM role`
        db.query(getRolesSql, (err, rows) => {
            if (err) { console.log(err.message) }
            const roles = data.map(({ id, title }) => ({ name: title, value: id }))
            inquirer.prompt([{
                type: 'list',
                name: 'role',
                message: 'What is the new employee\'s role?',
                choices: roles
            }]).then(roleChoice => {
                params.push(roleChoice)
                const getMgrSql = `SELECT * FROM employee`
                db.query(getMgrSql, (err, rows) => {
                    if (err) { console.log(err.message) }
                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ]).then(managerChoice => {
                        const manager = managerChoice.manager
                        params.push(manager)
                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`
                        db.query(sql, params, (err, rows) => {
                            if (err) { console.log(err.message) }
                            console.log("\nEmployee added to database.")
                        })
                    })
                })
            })
        })
    })
    promptMainMenu()
}

const updateEmployeeRole = () => {
    const sql = `
                UPDATE employee SET role_id = ? WHERE id = ?`
    params = [response.employeetoupdate, response.newemployeerole]

    db.query(sql, params, (err, rows) => {
        if (err) { console.log(err.message) }
        console.log((`====================================================================================`))
        console.log(`                      Employee successfully added to database.`)
        console.log((`====================================================================================`))
        promptMainMenu()
    })

}

const viewTotalUtilizedDeptBudget = () => {
    console.log("Not yet supported")
    promptMainMenu()
}


