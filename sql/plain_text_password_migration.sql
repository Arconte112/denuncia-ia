-- Migración para cambiar de contraseñas hash a texto plano

-- 1. Crear una columna temporal para almacenar las nuevas contraseñas en texto plano
ALTER TABLE users ADD COLUMN password TEXT;

-- 2. Establecer contraseñas predeterminadas en texto plano (debes cambiarlas después manualmente)
-- Usamos una contraseña estándar temporal para todos los usuarios
UPDATE users SET password = 'contraseña123';

-- 3. Eliminamos la columna password_hash que ya no usaremos
ALTER TABLE users DROP COLUMN password_hash;

-- NOTAS:
-- 1. Este script debe ejecutarse en la consola SQL de Supabase
-- 2. Después de ejecutar este script, deberías cambiar las contraseñas de todos los usuarios
--    a valores apropiados manualmente o mediante una interfaz de administración
-- 3. Las contraseñas en texto plano representan un riesgo de seguridad importante
--    Solo utiliza este enfoque en entornos de desarrollo o si tienes medidas de seguridad
--    adicionales robustas implementadas en otros niveles. 