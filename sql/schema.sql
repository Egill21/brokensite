CREATE TABLE categories (
  id serial primary key,
  title varchar(128) unique not null
);

CREATE TABLE products (
  id serial primary key,
  title varchar(128) unique not null,
  price int not null,
  descr varchar(256) not null,
  img varchar(128),
  created timestamp with time zone not null default current_timestamp,
  FOREIGN KEY (title) REFERENCES categories(title) 
);

CREATE TABLE users (
  id serial primary key,
  username varchar(128) unique not null,
  email varchar(64) unique not null,
  password varchar(256) not null,
  admin bit default false
);

CREATE TABLE orders (
  id serial primary key,
  FOREIGN KEY (username) REFERENCES users(username),
  order bit, 
  title varchar(128),
  address varchar(128),
  created timestamp with time zone not null default current_timestamp
);

CREATE TABLE inorder (
  FOREIGN KEY (order) REFERENCES orders(order),
  FOREIGN KEY (title) REFERENCES products(title),
  amount int
);