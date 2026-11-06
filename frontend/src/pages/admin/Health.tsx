import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { Icon, type IconName } from "../../components/Icon";

type Service = { name: string; status: string };

const names: Record<string, string> = {
  app: "Aplicación",
  database: "Base de datos",
  jamendo: "Jamendo",
  aggregates: "Agregados",
};

const states: Record<string, { label: string; icon: IconName }> = {
  up: { label: "En línea", icon: "check" },
  down: { label: "Caído", icon: "close" },
  delayed: { label: "Con retraso", icon: "bell" },
  not_configured: { label: "Sin configurar", icon: "link" },
};

export function HealthCards() {
  const health = useQuery({
    queryKey: ["admin-health"],
    queryFn: () => api<{ services: Service[] }>("/api/admin/health"),
    refetchInterval: 15000,
  });
  if (health.isError) return <p className="muted">Datos no disponibles por ahora</p>;
  return (
    <ul className="health" aria-label="Salud del sistema">
      {health.data?.services.map((service) => {
        const state = states[service.status] ?? { label: service.status, icon: "bell" as const };
        return (
          <li key={service.name} data-status={service.status}>
            <Icon name={state.icon} />
            <div>
              <b>{names[service.name] ?? service.name}</b>
              <small>{state.label}</small>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Health() {
  return <HealthCards />;
}
