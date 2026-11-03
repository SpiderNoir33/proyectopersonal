export function apiErrorMessage(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 429)
    return "Demasiadas peticiones, espera unos minutos e intenta de nuevo";
  if (message) return message;
  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error")
    return "No se pudo conectar con el servidor. ¿Está encendido el backend?";
  return "Ocurrió un error inesperado";
}

export function fieldErrors(error) {
  return error?.response?.data?.errors ?? {};
}

export function zodIssuesToErrors(issues) {
  return (issues ?? []).reduce((acc, i) => {
    acc[i.path.join(".")] = i.message;
    return acc;
  }, {});
}
