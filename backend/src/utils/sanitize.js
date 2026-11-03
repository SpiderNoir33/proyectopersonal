export const sanitizeUser = (user) => ({
  id: user._id,
  nombre: user.nombre,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});
