INSERT INTO department (name)
VALUES
    ('Accounting'),
    ('Human Resources'),
    ('Marketing'),
    ('Legal'),
    ('Operations'),
    ('Sales'),
    ('Tech');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Accountant', 70000, 1),
    ('Accounting Manager', 75000, 1),
    ('Talent Acquisition', 60000, 2),
    ('Compliance Manager', 65000, 2),
    ('Training and Safety Manager', 65000, 2),
    ('Comp and Benefits Manager', 67000, 2),
    ('Chief Human Resources Officer', 100000, 2),
    ('Chief Marketing Officer', 120000, 3),
    ('Creative Director', 105000, 3),
    ('Marketing Manager', 90000, 3),
    ('Legal Assistant', 60000, 4),
    ('General Counsel', 110000, 4),
    ('Chief Legal Officer', 150000, 4),
    ('Project Manager', 80000, 5),
    ('Operations Manager', 95000, 5),
    ('Chief Operations Officer', 130000, 5),
    ('Sales Representative', 65000, 6),
    ('Sales Specialist', 75000, 6),
    ('Account Executive', 85000, 6),
    ('Junior Software Developer', 90000, 7),
    ('Senior Software Developer', 150000, 7),
    ('Database Administrator', 150000, 7),
    ('QA Engineer', 80000, 7),
    ('Chief Technology Officer', 150000, 7);

/*
Managers must be loaded first
*/
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('James', 'Fraser', 2, NULL),
    ('Heathcote', 'Williams', 7, NULL),
    ('Samuel', 'Delany', 13, NULL),
    ('Monica', 'Bellucci', 16, NULL),
    ('Alexander', 'Pope', 19, NULL),
    ('George', 'Shaw', 24, NULL),
    ('Jack', 'London', 1, 1),
    ('Robert', 'Bruce', 3, 2),
    ('Peter', 'Greenaway', 4, 2),
    ('Derek', 'Jarman', 5, 2),
    ('Paolo', 'Pasolini', 6, 2),
    ('Sandy', 'Powell', 9, 3),
    ('Emil', 'Zola', 10, 3),
    ('Sissy', 'Coalpits', 11, 3),
    ('Antoinette', 'Capet', 12, 3),
    ('Tony', 'Duvert', 14, 4),
    ('Dennis', 'Cooper', 15, 4),
    ('Samuel', 'Johnson', 17, 5),
    ('John', 'Dryden', 18, 5),
    ('Lionel', 'Johnson', 20, 6),
    ('Aubrey', 'Beardsley', 21, 6),
    ('Tulse', 'Luper', 22, 6),
    ('William', 'Morris', 23, 6);
  