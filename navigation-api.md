# Human Appeal Admin Backend

# Navigation API Documentation

## Base URL

```
http://localhost:3001
```

---

# Authentication

All protected endpoints require JWT authentication.

### Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

# Required Permission

Navigation APIs require:

```
manage_navigation
```

Users without this permission will receive:

```json
{
    "success": false,
    "message": "Permission denied"
}
```

---

# 1. Menu APIs

## Create Menu

### Endpoint

```
POST /menus
```

### Request Body

```json
{
    "name": "Main Menu",
    "location": "header",
    "is_active": 1
}
```

### Response

```json
{
    "success": true,
    "message": "Menu created successfully"
}
```

---

## Get All Menus

### Endpoint

```
GET /menus
```

### Response

```json
{
    "success": true,
    "data": []
}
```

---

## Get Menu By ID

### Endpoint

```
GET /menus/:id
```

Example:

```
GET /menus/1
```

---

## Update Menu

### Endpoint

```
PUT /menus/:id
```

Example:

```
PUT /menus/1
```

### Request Body

```json
{
    "name": "Main Navigation",
    "location": "header",
    "is_active": 1
}
```

---

## Delete Menu

### Endpoint

```
DELETE /menus/:id
```

Uses soft delete.

The record is not permanently removed.

---

## Restore Menu

### Endpoint

```
PATCH /menus/:id/restore
```

---

# 2. Menu Item APIs

## Create Menu Item

### Endpoint

```
POST /menu-items
```

### Request Body

```json
{
    "menu_id": 1,
    "parent_id": null,
    "label_en": "Home",
    "label_ur": "ہوم",
    "type": "custom",
    "url": "/",
    "target": "_self",
    "sort_order": 1,
    "is_active": 1
}
```

---

## Get All Menu Items

### Endpoint

```
GET /menu-items
```

---

## Get Menu Items By Menu

### Endpoint

```
GET /menu-items/menu/:menu_id
```

Example:

```
GET /menu-items/menu/1
```

---

## Get Navigation Tree

### Endpoint

```
GET /menu-items/tree/:menu_id
```

Example:

```
GET /menu-items/tree/1
```

### Response Example

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "label_en": "Home",
            "children": []
        }
    ]
}
```

---

# 3. Navigation Item APIs

## Create Navigation Item

### Endpoint

```
POST /navigation
```

### Request Body

```json
{
    "menu_id": 1,
    "label_en": "Contact Us",
    "label_ur": "رابطہ کریں",
    "type": "custom",
    "url": "/contact",
    "target": "_self",
    "sort_order": 4
}
```

### Response

```json
{
    "success": true,
    "message": "Navigation item created successfully"
}
```

---

## Update Navigation Item

### Endpoint

```
PUT /navigation/:id
```

Example:

```
PUT /navigation/4
```

### Request Body

```json
{
    "label_en": "Contact",
    "label_ur": "رابطہ",
    "type": "custom",
    "url": "/contact-us",
    "target": "_self",
    "sort_order": 4
}
```

### Response

```json
{
    "success": true,
    "message": "Navigation item updated successfully"
}
```

---

## Delete Navigation Item

### Endpoint

```
DELETE /navigation/:id
```

Example:

```
DELETE /navigation/4
```

Uses soft delete.

### Response

```json
{
    "success": true,
    "message": "Navigation item deleted successfully"
}
```

---

## Restore Navigation Item

### Endpoint

```
PATCH /navigation/:id/restore
```

Example:

```
PATCH /navigation/4/restore
```

### Response

```json
{
    "success": true,
    "message": "Navigation item restored successfully"
}
```

---

# Reorder Navigation Items

## Endpoint

```
PATCH /navigation/reorder
```

### Request Body

```json
{
    "items": [
        {
            "id": 1,
            "sort_order": 1
        },
        {
            "id": 2,
            "sort_order": 2
        },
        {
            "id": 3,
            "sort_order": 3
        }
    ]
}
```

### Response

```json
{
    "success": true,
    "message": "Navigation order updated successfully"
}
```

---

# Database Information

Main tables:

```
menus
menu_items
```

Important fields:

## menus

| Column     | Purpose                |
| ---------- | ---------------------- |
| id         | Primary key            |
| name       | Menu name              |
| location   | Header/footer location |
| is_active  | Menu status            |
| deleted_at | Soft delete timestamp  |

---

## menu_items

| Column     | Purpose               |
| ---------- | --------------------- |
| id         | Primary key           |
| menu_id    | Related menu          |
| parent_id  | Parent item           |
| label_en   | English label         |
| label_ur   | Urdu label            |
| type       | Item type             |
| url        | Navigation URL        |
| target     | Link target           |
| sort_order | Display order         |
| deleted_at | Soft delete timestamp |

---

# Testing Flow

1. Login:

```
POST /auth/login
```

2. Copy JWT token.

3. Add header:

```
Authorization: Bearer <token>
```

4. Test Navigation endpoints.

---

# Completed Module Status

Authentication ✅
Users API ✅
Permissions API ✅
Navigation API ✅

Next recommended module:

Roles Management API
