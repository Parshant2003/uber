# User Registration Endpoint

## Endpoint
`POST /user/register`

## Description
This endpoint is used to register a new user. It validates the input data, hashes the password, creates a new user in the database, and returns a JSON Web Token (JWT) for authentication.

## Request Body
The request body should be a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "string (min length: 3, required)",
    "lastname": "string (min length: 3, optional)"
  },
  "email": "string (valid email, required)",
  "password": "string (min length: 6, required)"
}
```

## Error Response
The error response will be a JSON object with the following structure:

```json
{
  "errors": [
    {
      "msg": "string",
      "param": "string",
      "location": "string"
    }
  ]
}
