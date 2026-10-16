-- Restaura la lógica de base de datos que se perdió al migrar a Supabase:
--   * códigos automáticos de artículos (ADM-00001 / ALM-00001)
--   * historial al dar de baja artículos administrativos
--   * registro de "actividad reciente" para el tablero
-- Es idempotente: se puede ejecutar varias veces.

-- 1) Columnas de código que el backend y el frontend ya esperan.
ALTER TABLE public.articulos_almacenamiento ADD COLUMN IF NOT EXISTS codigo VARCHAR;
ALTER TABLE public.articulos_baja_historial ADD COLUMN IF NOT EXISTS codigo VARCHAR;

-- 2) Códigos automáticos.
CREATE OR REPLACE FUNCTION public.asignar_codigo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo := TG_ARGV[0] || '-' || lpad(NEW.id::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_codigo_administrativo ON public.articulos_administrativos;
CREATE TRIGGER trg_codigo_administrativo
  BEFORE INSERT ON public.articulos_administrativos
  FOR EACH ROW EXECUTE FUNCTION public.asignar_codigo('ADM');

DROP TRIGGER IF EXISTS trg_codigo_almacen ON public.articulos_almacenamiento;
CREATE TRIGGER trg_codigo_almacen
  BEFORE INSERT ON public.articulos_almacenamiento
  FOR EACH ROW EXECUTE FUNCTION public.asignar_codigo('ALM');

UPDATE public.articulos_administrativos SET codigo = 'ADM-' || lpad(id::text, 5, '0') WHERE codigo IS NULL OR codigo = '';
UPDATE public.articulos_almacenamiento SET codigo = 'ALM-' || lpad(id::text, 5, '0') WHERE codigo IS NULL OR codigo = '';

-- 3) Al eliminar un artículo administrativo, queda registrado en articulos_baja.
CREATE OR REPLACE FUNCTION public.registrar_baja_administrativa()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO articulos_baja (id_articulo, fecha_baja, descripcion, proveedor, ubicacion, observacion, precio, codigo)
  VALUES (OLD.id, CURRENT_DATE, OLD.descripcion, OLD.proveedor, OLD.ubicacion, OLD.observacion, OLD.precio, OLD.codigo);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_baja_administrativa ON public.articulos_administrativos;
CREATE TRIGGER trg_baja_administrativa
  BEFORE DELETE ON public.articulos_administrativos
  FOR EACH ROW EXECUTE FUNCTION public.registrar_baja_administrativa();

-- 4) Actividad reciente para el tablero.
CREATE OR REPLACE FUNCTION public.registrar_actividad()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  detalle TEXT;
BEGIN
  -- IF/ELSIF (no CASE): cada rama solo accede a columnas que existen en su tabla.
  IF TG_TABLE_NAME = 'articulos_administrativos' THEN
    detalle := 'Nuevo artículo administrativo: ' || NEW.descripcion;
  ELSIF TG_TABLE_NAME = 'articulos_almacenamiento' THEN
    detalle := 'Nuevo producto en almacén: ' || NEW.producto;
  ELSIF TG_TABLE_NAME = 'movimientos_almacen' THEN
    detalle := CASE WHEN NEW.tipo_movimiento = 2 THEN 'Entrada' ELSE 'Salida' END
               || ' de almacén solicitada por ' || NEW.solicitante;
  ELSIF TG_TABLE_NAME = 'traslados' THEN
    detalle := 'Traslado de ' || NEW.ubicacion_inicial || ' a ' || NEW.ubicacion_final;
  ELSIF TG_TABLE_NAME = 'articulos_baja' THEN
    detalle := 'Baja de artículo administrativo: ' || NEW.descripcion;
  ELSIF TG_TABLE_NAME = 'articulos_baja_historial' THEN
    detalle := 'Baja de producto de almacén: ' || NEW.producto;
  END IF;

  INSERT INTO ultimo_registro (tipo_tabla, fecha_registro, descripcion, tabla_origen_id, fecha)
  VALUES (TG_ARGV[0], now(), left(detalle, 500), NEW.id, CURRENT_DATE);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actividad_administrativo ON public.articulos_administrativos;
CREATE TRIGGER trg_actividad_administrativo AFTER INSERT ON public.articulos_administrativos
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Artículo administrativo');

DROP TRIGGER IF EXISTS trg_actividad_almacen ON public.articulos_almacenamiento;
CREATE TRIGGER trg_actividad_almacen AFTER INSERT ON public.articulos_almacenamiento
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Almacén');

DROP TRIGGER IF EXISTS trg_actividad_movimiento ON public.movimientos_almacen;
CREATE TRIGGER trg_actividad_movimiento AFTER INSERT ON public.movimientos_almacen
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Movimiento');

DROP TRIGGER IF EXISTS trg_actividad_traslado ON public.traslados;
CREATE TRIGGER trg_actividad_traslado AFTER INSERT ON public.traslados
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Traslado');

DROP TRIGGER IF EXISTS trg_actividad_baja ON public.articulos_baja;
CREATE TRIGGER trg_actividad_baja AFTER INSERT ON public.articulos_baja
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Baja administrativa');

DROP TRIGGER IF EXISTS trg_actividad_baja_almacen ON public.articulos_baja_historial;
CREATE TRIGGER trg_actividad_baja_almacen AFTER INSERT ON public.articulos_baja_historial
  FOR EACH ROW EXECUTE FUNCTION public.registrar_actividad('Baja de almacén');

-- Las funciones nuevas tampoco quedan expuestas a la API pública de Supabase.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, public;
