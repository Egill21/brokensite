# Hópverkefni 1

## Authors
Ásdís Erla Jóhannsdóttir <br />
Egill Ragnarsson <br />
Flóki Þorleifsson <br />

## SETUP

### Run locally:

If desired, it is possible to set up the project locally by cloning this repository:

```bash
> git clone https://github.com/Egill21/veff-hopverkefni1.git
> cd veff-hopverkefni1
> git remote remove origin
> git remote add origin <link to repo>
> git push -u origin master
```

* Postgres database and a Cloudinary account is needed and the following variables need to be defined in a .env file in the root of the project:
    * DATABASE_URL
    * JWT_SECRET
    * CLOUDINARY_CLOUD
    * CLOUDINARY_API_KEY
    * CLOUDINARY_API_SECRET

* To set up the project, run the following commands from the command line:
    * npm install
    * npm run setup
* Finally, to run the project, run the following command:
    * npm run dev

### Run online

TODOO
Heroku link here

### Web API routes and examples

* `/`
    * `GET` returns all possible routes

### Users

* `/users/`
  * `GET` returns all users, only if user is admin
* `/users/:id`
  * `GET` returns user, only if user is admin
  * `PATCH` changes user, only if user is admin
    ```json
    > {
    >   "admin": true 
    > }
    ```
* `/users/register`
  * `POST` comfirms and creates user. returns authentication token and email. User is not admin by default
    ```json
    > {
    >   "username": "john123",
    >   "email": "john@john.com",
    >   "password": "123456" 
    > }
    ```
* `/users/login`
  * `POST` with email and password returns token if data is correct
    ```json
    > {
    >   "email": "john@john.com",
    >   "password": "123456"
    > }
    ```
* `/users/me`
  * `GET` returns user information about the owner of the token, authentication and email, only if user is logged in
  * `PATCH` updates email, password or both if data is correct, only if user is logged in
    ```json
    > {
    >   "email": "john2@john.com",
    >   "password": "654321" 
    > }
    ```
### Products

* `/products`
  * `GET` returns a page of products, most recently added first
  * `POST` creates new product if valid only if user is admin
    ```json
    > {
    >   "title": "Intelligent Wooden Pizza",
    >   "price": 370,
    >   "descr": "Ad quia aut et et. Dolorem aut suscipit temporibus. Veniam ut et eos est.",
    >   "img": (link to photo) [optional],
    >   "category": "Toys",
    > }
    ```
* `/products?category={category}`
  * `GET` returns a page og products in the category, most recently added first
* `/products?search={query}`
  * `GET` Returns a page of products where `{query}` is in the title or description, most recently added first
* `/products/:id`
  * `GET` returns product
  * `PATCH` updates product, only if user is admin
    ```json
    > {
    >   "title": "Tasty Soft Cheese"
    > }
    ```
  * `DELETE` deletes product, only if user is admin
* `/categories`
  * `GET` returns page of categories
  * `POST` creates category if valid and returns it, only if user is admin
    ```json
    > {
    >   "title": "Toys"
    > }
    ```
* `/categories/:id`
  * `PATCH` updates category, only if user is admin
    ```json
    > {
    >   "title": "Tools"
    > }
    ```
  * `DELETE` deletes category, only if user is admin

### Cart/orders

* `/cart`
  * `GET` returns the users cart and its content and total price, only if user is logged in
  * `POST` adds product to cart, amount and product id are required, only if user is logged in
    ```json
    > {
    >   "productId": "Tools",
    >   "amount": 2
    > }
    ```
* `/cart/line/:id`
  * `GET` returns line in cart including amount and information about product, only if user is logged in
  * `PATCH` updated the amount in a line in the users cart, only if user if logged in
    ```json
    > {
    >   "amount": 3
    > }
    ```
  * `DELETE` deletes line from users cart, only if user is logged in
* `/orders`
  * `GET` returns a page of orders, most recently added orders first, if regular user: only the users orders, if admin: all orders
  * `POST` creates order from cart with appropriate values, only if user is logged in
    ```json
    > {
    >   "name": "John Doe",
        "address": "7478 Mayflower St."
    > }
    ```
* `/orders/:id`
  * `GET` returns the order with all lines, the orders values and total price of order, only if user is logged in or if user is admin

