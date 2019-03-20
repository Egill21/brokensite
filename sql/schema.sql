CREATE TABLE categories
(
  id serial primary key,
  title varchar(128) unique not null
);

CREATE TABLE products
(
  id serial,
  title varchar(128) unique not null primary key,
  price varchar(32) not null,
  descr varchar(1456) not null,
  img varchar(128),
  created timestamp
  with time zone not null default current_timestamp,
  category varchar(128) not null
);

  CREATE TABLE users
  (
    id serial,
    username varchar(64) unique not null primary key,
    email varchar(64) unique not null,
    password varchar(256) not null,
    admin BOOLEAN DEFAULT false
  );

  CREATE TABLE orders
  (
    id serial primary key,
    username varchar(128) not null,
    FOREIGN KEY (username) REFERENCES users(username),
    orderNum bit unique,
    title varchar
    (128),
    address varchar
    (128),
    created timestamp
    with time zone not null default current_timestamp
);

    CREATE TABLE inorder
    (
      orderNum bit not null,
      title varchar
    (128) not null ,
      FOREIGN KEY
    (orderNum) REFERENCES orders
    (orderNum),
      FOREIGN KEY
    (title) REFERENCES products
    (title),
      amount int
    );