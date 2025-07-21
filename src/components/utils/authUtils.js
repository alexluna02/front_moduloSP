import {jwtDecode} from 'jwt-decode';

export const validarAutorizacion = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { valido: false, error: 'No hay token' };

  try {
    const decoded = jwtDecode(token);
    const expirado = decoded.exp < Date.now() / 1000;

    if (expirado) {
      localStorage.removeItem('token');
      return { valido: false, error: 'Token expirado' };
    }

    const response = await fetch('https://aplicacion-de-seguridad-v2.onrender.com/api/usuarios/verificar-token', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      return { valido: false, error: 'Token inválido' };
    }

    return { valido: true, usuario: decoded };
  } catch (error) {
    return { valido: false, error: 'Error al verificar el token' };
  }
};
