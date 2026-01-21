
# vercely

A react.js application deployment Paas(platform as a service)


## Run Locally

Clone the project

```bash
  git clone https://github.com/VanshDubey101963/vercely.git
```

Install server dependencies

```bash
  npm install
```

Install client dependencies

```bash
  cd vercely-ui
  npm install
```

Start the services

```bash
  npm run dev-upload
  npm run dev-deployment
  npm run dev-request
```

Start the client ui

```bash
  cd vercely-ui
  npm run dev
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

vercely-ui/.env

``` 
VITE_UPLOAD_SERVICE_URL
VITE_REQUEST_DOMAIN_NAME

```

./.env

```
STORAGE_ENDPOINT
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
MINIO_ROOT_USER
MINIO_ROOT_PASSWORD
```

## Screenshots

![App Screenshot]()

