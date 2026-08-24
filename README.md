# YOJHAN-STORE Web

Tienda profesional de paneles Free Fire con venta directa por WhatsApp, panel admin privado y base de datos MySQL lista para Railway.

## Panel admin

Ruta privada:

```txt
/yojhan-control-web729hf
```

Credenciales por defecto:

```txt
Usuario: YOJHAN
Contrasena: WEB729HF
```

## Variables para Railway

Variables manuales:

```env
NODE_ENV=production
JWT_SECRET=cambia_este_secreto_largo_yojhan_store
ADMIN_USERNAME=YOJHAN
ADMIN_PASSWORD=WEB729HF
APP_URL=https://tu-dominio.up.railway.app
```

Variables MySQL como referencias del servicio MySQL:

```env
MYSQL_URL=${{MySQL.MYSQL_URL}}
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
```

## Railway

Comando de inicio:

```bash
npm start
```

Healthcheck:

```txt
/health
```

No tienes que ejecutar migraciones manuales. El servidor crea la base, tablas, admin y productos si no existen.
