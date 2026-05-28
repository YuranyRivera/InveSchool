-- InveSchool - Schema extraído del backup original (20-02-2025)
-- Ejecutar en Supabase > SQL Editor > New query

-- 1. Artículos administrativos activos
CREATE TABLE IF NOT EXISTS public.articulos_administrativos (
    id          SERIAL PRIMARY KEY,
    fecha       date,
    descripcion text,
    proveedor   character varying,
    ubicacion   character varying,
    observacion text,
    precio      numeric,
    codigo      character varying
);

-- 2. Artículos en almacenamiento (inventario principal)
CREATE TABLE IF NOT EXISTS public.articulos_almacenamiento (
    id                 SERIAL PRIMARY KEY,
    modulo             character varying,
    estante            character varying,
    producto           character varying,
    cantidad           integer,
    estado             character varying,
    created_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    entrada            integer DEFAULT 0,
    salida             integer DEFAULT 0,
    restante           integer DEFAULT 0,
    cantidad_productos integer
);

-- 3. Artículos dados de baja (con referencia al artículo administrativo original)
CREATE TABLE IF NOT EXISTS public.articulos_baja (
    id          SERIAL PRIMARY KEY,
    id_articulo integer,
    fecha_baja  date DEFAULT CURRENT_DATE,
    descripcion text,
    proveedor   character varying,
    ubicacion   character varying,
    observacion text,
    precio      numeric,
    codigo      character varying
);

-- 4. Historial de bajas del almacenamiento (con foto en Cloudinary)
CREATE TABLE IF NOT EXISTS public.articulos_baja_historial (
    id           SERIAL PRIMARY KEY,
    id_articulo  integer,
    producto     character varying,
    motivo_baja  character varying,
    fecha_baja   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_baja character varying,
    imagen_baja  character varying,
    cantidad     integer DEFAULT 1
);

-- 5. Movimientos de almacén (entradas y salidas)
CREATE TABLE IF NOT EXISTS public.movimientos_almacen (
    id                 SERIAL PRIMARY KEY,
    tipo_movimiento    integer,          -- 1 = Salida, 2 = Entrada
    solicitante        character varying,
    fecha              timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cantidad_productos text,             -- cantidades separadas por coma
    rol                text,
    id_productos       text,             -- IDs separados por coma
    articulo_id        integer,
    nombre_producto    text,
    nombre_productos   text              -- nombres separados por coma
);

-- 6. Traslados de artículos administrativos entre ubicaciones
CREATE TABLE IF NOT EXISTS public.traslados (
    id                SERIAL PRIMARY KEY,
    responsable       character varying,
    fecha             date DEFAULT CURRENT_DATE,
    ubicacion_inicial character varying,
    ubicacion_final   character varying,
    id_articulo       integer
);

-- 7. Auditoría del último cambio registrado
CREATE TABLE IF NOT EXISTS public.ultimo_registro (
    id              SERIAL PRIMARY KEY,
    tipo_tabla      character varying,
    fecha_registro  timestamp without time zone,
    descripcion     text,
    tabla_origen_id integer,
    fecha           date DEFAULT CURRENT_DATE
);

-- 8. Usuarios del sistema
CREATE TABLE IF NOT EXISTS public.usuarios (
    id         SERIAL PRIMARY KEY,
    nombre     character varying,
    correo     character varying,
    "contraseña" character varying,
    rol        character varying DEFAULT ''
);
