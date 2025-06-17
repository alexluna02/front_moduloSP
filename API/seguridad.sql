CREATE TABLE public.permisos (
    id_permiso integer NOT NULL,
    nombre_permiso character varying(100) NOT NULL,
    descripcion text,
    CONSTRAINT permisos_pkey PRIMARY KEY (id_permiso),
    CONSTRAINT permisos_nombre_permiso_key UNIQUE (nombre_permiso)
);

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(100) NOT NULL,
    descripcion text,
    CONSTRAINT roles_pkey PRIMARY KEY (id_rol),
    CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol)
);

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    usuario character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    estado boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT usuarios_usuario_key UNIQUE (usuario)
);

CREATE TABLE public.roles_permisos (
    id_rol integer NOT NULL,
    id_permiso integer NOT NULL,
    CONSTRAINT roles_permisos_pkey PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT roles_permisos_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE CASCADE,
    CONSTRAINT roles_permisos_id_permiso_fkey FOREIGN KEY (id_permiso) REFERENCES public.permisos(id_permiso) ON DELETE CASCADE
);

CREATE TABLE public.usuarios_roles (
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_roles_pkey PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT usuarios_roles_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT usuarios_roles_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE CASCADE
);

CREATE TABLE public.auditoria (
    id integer NOT NULL,
    accion character varying(20) NOT NULL,
    modulo character varying(20) NOT NULL,
    tabla character varying(50) NOT NULL,
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    details jsonb,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT auditoria_pkey PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_auditoria_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE RESTRICT
);