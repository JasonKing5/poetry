
## Register

```bash
curl -X POST "http://localhost:4000/api/auth/register" \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"jason1@example.com","name":"jason1","password":"123456"}'
```

## Login (root)

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"root@example.com","password":"123456"}'
```

## Login (user)

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"jason@example.com","password":"123456"}'
```

## Users

```bash
curl -X GET "http://localhost:4000/api/users"
```