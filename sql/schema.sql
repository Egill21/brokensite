CREATE TABLE categories
(
  id serial primary key,
  title varchar(128) unique not null
);

CREATE TABLE products
(
  id serial primary key,
  title varchar(128) unique not null,
  price varchar(32) not null,
  descr varchar(1500) not null,
  img varchar(640),
  created timestamp
  with time zone not null default current_timestamp,
  category varchar
  (128) not null,
  FOREIGN KEY
  (category) REFERENCES categories
  (title)
);

CREATE TABLE users
(
  id serial primary key,
  username varchar(64) unique not null,
  email varchar(64) unique not null,
  password varchar(256) not null,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE carts
(
  id serial primary key,
  userid int not null,
  FOREIGN KEY (userid) REFERENCES users(id),
  isorder bit unique,
  name varchar
  (128),
  address varchar
  (128),
  created timestamp
  with time zone not null default current_timestamp
);

CREATE TABLE incart
(
  id serial primary key,
  cartid int not null,
  productid int not null,
  amount int,
  FOREIGN KEY (cartid) REFERENCES carts(id),
  FOREIGN KEY (productid) REFERENCES products(id)
);