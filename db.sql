postgres=# CREATE USER bancosolar WITH SUPERUSER PASSWORD '12345';
CREATE ROLE


postgres=# CREATE DATABASE bancosolar;
CREATE DATABASE


postgres=# \c bancosolar;
Ahora está conectado a la base de datos «bancosolar» con el usuario «postgres».


bancosolar=# CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(50), balance FLOAT CHECK (balance >= 0));
CREATE TABLE


bancosolar=# CREATE TABLE transferencias (id SERIAL PRIMARY KEY, emisor INT, receptor INT, monto FLOAT, fecha TIMESTAMP, FOREIGN KEY (emisor) REFERENCES usuarios(id), FOREIGN KEY (receptor) REFERENCES usuarios(id));
CREATE TABLE