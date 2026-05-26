drop database if exists ciscoLab;
create database ciscoLab;
use ciscoLab;

-- 1. USUARIOS
create table usuarios (
    idUsuario int primary key auto_increment,
    tipo enum('alumno', 'docente') not null,
    nombre varchar(100) not null,
    apellidos varchar(100) not null,
    sexo enum('M', 'F') not null,
    correo varchar(100) not null unique,
    contrasena varchar(255) not null
);

INSERT INTO usuarios (tipo, nombre, apellidos, sexo, correo, contrasena) VALUES
('alumno', 'David', 'Calderon Chavez', 'M', 'S22120226@alumnos.itsur.edu.mx', sha2('quesidogo92', 256)),
('alumno', 'José Manuel', 'Cerritos Jiménez', 'F', 'S22120175@alumnos.itsur.edu.mx', sha2('hola123', 256)),
('docente', 'Antonio', 'Tierras Negras', 'M', 'tierras@itsur.edu.mx', sha2('tierras', 256)),
('docente', 'Efren', 'Vega Chávez', 'M', 'efren@itsur.edu.mx', sha2('efren', 256)),
('docente', 'Profe', 'Automotriz', 'M', 'profeamotriz@itsur.edu.mx', sha2('automotriz', 256));

-- 2. ALUMNOS
create table alumnos (
    noControl varchar(20) primary key,
    carrera varchar(100) not null,
    semestre tinyint not null,
    idUsuario int not null,
    foreign key (idUsuario) references usuarios(idUsuario) on delete cascade
);

INSERT INTO alumnos (noControl, carrera, semestre, idUsuario) VALUES
('S22120226', 'Ingenieria en Sistemas Computacionales', 8, 1),
('S22120175', 'Ingenieria en Sistemas Computacionales', 8, 2);

-- 3. DOCENTES
create table docentes (
    noControl varchar(20) primary key,
    idUsuario int not null,
    foreign key (idUsuario) references usuarios(idUsuario) on delete cascade
);

INSERT INTO docentes (noControl, idUsuario) VALUES
('DS001', 3),
('DS002', 4),
('DA001', 5);

-- 4. MATERIAS
create table materias (
    clave varchar(20) primary key,
    nombre varchar(100) not null
);

INSERT INTO materias (clave, nombre) VALUES
('MAT01', 'Tierras I'),
('MAT02', 'Tierras II'),
('MAT03', 'Tierras III'),
('MAT04', 'Tierras IV'),
('MAT05', 'Principios electricos');

-- 5. LABORATORIOS
create table laboratorios (
    idLaboratorio int primary key auto_increment,
    nombre varchar(100) not null unique,
    edificio varchar(20),
    capacidad tinyint,
    mostrarSiempre tinyint(1) default 0
);

INSERT INTO laboratorios (nombre, edificio, capacidad, mostrarSiempre) VALUES
('Lab Redes Cisco', 'TICS', 2, 1),
('Lab Electrónica', 'Edificio E', 6, 1);

-- 6. ESTACIONES
create table estaciones (
    idEstacion int primary key auto_increment,
    noEstacion tinyint not null,
    estado enum('disponible', 'mantenimiento') default 'disponible',
    idLaboratorio int not null,
    foreign key (idLaboratorio) references laboratorios(idLaboratorio) on delete cascade
);

INSERT INTO estaciones (idLaboratorio, noEstacion, estado) VALUES
(1, 1, 'disponible'), (1, 2, 'disponible'),
(2, 1, 'disponible'), (2, 2, 'disponible'),
(2, 3, 'disponible'), (2, 4, 'disponible'),
(2, 5, 'disponible'), (2, 6, 'mantenimiento');

-- 7. CLASES
create table clases (
    idClase int primary key auto_increment,
    idMateria varchar(20) not null,
    idDocente varchar(20) not null,
    idLaboratorio int not null,
    hora time not null,
    foreign key (idMateria) references materias(clave) on delete cascade,
    foreign key (idDocente) references docentes(noControl) on delete cascade,
    foreign key (idLaboratorio) references laboratorios(idLaboratorio) on delete cascade
);

INSERT INTO clases (idMateria, idDocente, idLaboratorio, hora) VALUES
('MAT01', 'DS001', 1, '08:00:00'),
('MAT02', 'DS001', 1, '09:00:00'),
('MAT05', 'DA001', 2, '10:00:00');

-- 8. INSCRIPCIONES
create table inscripciones (
    idInscripcion int primary key auto_increment,
    idAlumno varchar(20) not null,
    idClase int not null,
    foreign key (idAlumno) references alumnos(noControl) on delete cascade,
    foreign key (idClase) references clases(idClase) on delete cascade
);

INSERT INTO inscripciones (idAlumno, idClase) VALUES
('S22120226', 1), ('S22120175', 1);

-- 9. EQUIPOS
create table equipos (
    idEquipo int primary key auto_increment,
    idClase int,
    nombre varchar(100) not null,
    foreign key (idClase) references clases(idClase) on delete set null
);

INSERT INTO equipos (idClase, nombre) VALUES
(1, 'Equipo Alpha');

-- 10. ALUMNO_EQUIPO
create table alumno_equipo (
    id int primary key auto_increment,
    idAlumno varchar(20) not null,
    idEquipo int not null,
    idClase int,
    foreign key (idAlumno) references alumnos(noControl) on delete cascade,
    foreign key (idEquipo) references equipos(idEquipo) on delete cascade,
    foreign key (idClase) references clases(idClase) on delete set null
);

INSERT INTO alumno_equipo (idAlumno, idEquipo, idClase) VALUES
('S22120226', 1, 1),
('S22120175', 1, 1);

-- 11. RESERVAS
create table reservas (
    idReserva int primary key auto_increment,
    idEquipo int not null,
    idEstacion int not null,
    fecha date not null,
    hora time not null,
    estado enum('confirmada', 'pendiente', 'cancelada', 'inconclusa') default 'confirmada',
    fechaRegistro timestamp default current_timestamp,
    foreign key (idEquipo) references equipos(idEquipo) on delete cascade,
    foreign key (idEstacion) references estaciones(idEstacion) on delete cascade,
    unique(idEstacion, fecha, hora)
);

INSERT INTO reservas (idEquipo, idEstacion, fecha, hora, estado) VALUES
(1, 1, '2026-05-31', '08:00:00', 'confirmada');