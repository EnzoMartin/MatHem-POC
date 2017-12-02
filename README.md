# MatHem POC

Small project to play with the UX of a grocery website

## TODO
- [x] Scrape products
- [x] Scrape categories
- [x] Create data mappings
- [ ] Set up React/Vue app
- [ ] Category list view
- [ ] Product detail view
- [ ] Product search
- [ ] Filtering and discovery
- [ ] Caching

## Usage

- Install NodeJS 8.9+
- Install MySQL/MariaDB
- Install Redis
- Run `npm i` in repo root
- Create a database
- Create `.env` file with the following information:
    ```
    DB_USER=<db username>
    DB_PASSWORD=<db password>
    DB_PORT=3306
    DB_HOST=127.0.0.1
    DB_DATABASE=<db name>
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    ```
- Run `npm run db-up`
- Run `npm run dev`
