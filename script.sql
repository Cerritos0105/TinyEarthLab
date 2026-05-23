create database ciscoLab;
drop database ciscoLab;
use ciscoLab;

show tables;

-- drop table USUARIOS;
create table USUARIOS (
    noControl 	varchar(20) primary key,
    nombre 		varchar(100) not null,
    apellidos 	varchar(100) not null,
    sexo		enum('M', 'F') not null,
    correo 		varchar(100) not null unique,
    -- tipo 		enum('alumno', 'docente') not null,
	contrasena 	varchar(255) not null
);

INSERT INTO USUARIOS
(noControl, nombre, apellidos, sexo, correo, contrasena)
VALUES
('S22120226', 'David', 'Calderon Chavez', 'M', 'S22120226@alumnos.itsur.edu.mx', sha2('quesidogo92', 256)),
('S22120175', 'José Manuel', 'Cerritos Jiménez', 'F', 'S22120175@alumnos.itsur.edu.mx', sha2('hola123', 256)),
('DS001', 'Antonio', 'Tierras Negras', 'M', 'tierras@itsur.edu.mx', sha2('tierras', 256)),
('DS002', 'Efren', 'Vega Chávez', 'M', 'efren@itsur.edu.mx', sha2('efren', 256)),
('DA001', 'Profe', 'Automotriz', 'M', 'profeamotriz@itsur.edu.mx', sha2('automotriz', 256));
select * from USUARIOS;

create table EQUIPOS (
    idEquipo	int primary key auto_increment    
);
insert into EQUIPOS() values ();
select * from EQUIPOS;


create table ALUMNOS (
    noControl	varchar(20) primary key,
    carrera 	varchar(100) not null,
    semestre 	tinyint not null,
    idEquipo	int not null,

    foreign key (noControl) references USUARIOS(noControl) on delete cascade,
    foreign key (idEquipo) references EQUIPOS(idEquipo) on delete cascade
);
INSERT INTO ALUMNOS
(noControl, carrera, semestre, idEquipo)
VALUES
('S22120226', 'Ingenieria en Sistemas Computacionales', 8, 1),
('S22120175', 'Ingenieria en Sistemas Computacionales', 8, 1);
select * from ALUMNOS;

create table DOCENTES (
    noControl	varchar(20) primary key,
	carrera 	varchar(100) not null,

    foreign key (noControl) references USUARIOS(noControl) on delete cascade
);
INSERT INTO DOCENTES
(noControl, carrera)
VALUES
('DS001', 'Ingenieria en Sistemas Computacionales'),
('DS002', 'Ingenieria en Sistemas Computacionales'),
('DA001', 'Ingenieria en Sistemas Automotrices');
select * from DOCENTES;

create table LABORATORIOS (
    idLaboratorio	int primary key auto_increment,
    nombre			varchar(100) not null unique,
    edificio		varchar(100),
    capacidad		tinyint -- podria estar de mas
);
INSERT INTO LABORATORIOS
(nombre, edificio, capacidad)
VALUES
('Lab Redes Cisco', 'TICS', 2),
('Lab Electrónica', 'Edificio E', 6);
select * from LABORATORIOS;

drop table ESTACIONES;
create table ESTACIONES (
    idEstacion		int primary key auto_increment,
    idLaboratorio	int not null,
    noEstacion 		int not null,

    estado			enum('disponible', 'mantenimiento') default 'disponible',

    foreign key (idLaboratorio) references LABORATORIOS(idLaboratorio) on delete cascade
);
INSERT INTO ESTACIONES
(idLaboratorio, noEstacion, estado)
VALUES
(1, 1, 'disponible'),
(1, 2, 'disponible'),
(2, 1, 'disponible'),
(2, 2, 'disponible'),
(2, 3, 'disponible'),
(2, 4, 'disponible'),
(2, 5, 'disponible'),
(2, 6, 'mantenimiento');
select * from ESTACIONES;

drop table RESERVAS;
create table RESERVAS (
    idReserva		int primary key auto_increment,
    idEquipo        int not null,
    idEstacion		int not null,
    fecha			date not null,
    hora            time not null,

    estado             enum('confirmada', 'pendiente', 'cancelada', 'inconclusa') default 'confirmada',

    fechaRegistro      timestamp default current_timestamp,

    foreign key (idEquipo) references EQUIPOS(idEquipo) on delete cascade,
    foreign key (idEstacion) references ESTACIONES(idEstacion) on delete cascade,

    unique(idEstacion, fecha, hora)
);
INSERT INTO RESERVAS
(idEquipo, idEstacion, fecha, hora, estado)
VALUES
(1, 1, '2026-05-31', '08:00:00', 'confirmada');
select * from RESERVAS;

create table MATERIAS (
	idMateria 	int primary key auto_increment, -- debe ser varchar
    nombre 		varchar(100) not null
);
INSERT INTO MATERIAS
(nombre)
VALUES
('Tierras I'),
('Tierras II'),
('Tierras III'),
('Tierras IV'),
('Principios electricos');
select * from MATERIAS;

create table CLASES (
    idClase		varchar(10) primary key,
    idMateria	int not null,
    idDocente	varchar(20) not null,
    grupo 		char(1) not null,
    
    -- calificacion decimal(4,2),
    -- hora
    
    foreign key (idMateria) references MATERIAS(idMateria) on delete cascade,
    foreign key (idDocente) references DOCENTES(noControl) on delete cascade
);
INSERT INTO CLASES
(idClase, idMateria, idDocente, grupo)
VALUES
('RED1', 1, 'DS001', 'A'),
('RED2', 2, 'DS001', 'B'),
('RED3', 3, 'DS001', 'C'),
('RED4', 4, 'DS002', 'A'),
('PEL1', 5, 'DA001', 'A');
select * from CLASES;

create table INSCRIPCIONES (
    idAlumno    varchar(20) not null,
    idClase     varchar(10) not null,

    primary key (idAlumno, idClase),
    foreign key (idAlumno) references ALUMNOS(noControl) on delete cascade,
    foreign key (idClase) references CLASES(idClase) on delete cascade
);
INSERT INTO INSCRIPCIONES
(idAlumno, idClase)
VALUES
('S22120226', 'RED2'),
('S22120175', 'RED2');
select * FROM INSCRIPCIONES;