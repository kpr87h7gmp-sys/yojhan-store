# Subir YOJHAN-STORE a Railway

1. Sube esta carpeta a un repositorio nuevo de GitHub, por ejemplo `yojhan-store`.
2. En Railway crea un proyecto desde GitHub.
3. Agrega un servicio MySQL.
4. Conecta el servicio MySQL al servicio web.
5. En Variables del servicio web agrega:

```env
NODE_ENV=production
JWT_SECRET=cambia_este_secreto_largo_yojhan_store
ADMIN_USERNAME=YOJHAN
ADMIN_PASSWORD=WEB729HF
APP_URL=https://tu-dominio.up.railway.app
MYSQL_URL=${{MySQL.MYSQL_URL}}
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
```

6. Railway usara:

```bash
npm start
```

7. Verifica:

```txt
https://tu-dominio.up.railway.app/health
```

8. Panel privado:

```txt
https://tu-dominio.up.railway.app/yojhan-control-web729hf
```

Usuario: `YOJHAN`

Contrasena: `WEB729HF`
