import type { Service } from '@/types/content';

export interface ServicesListProps {
  services: Service[];
  id?: string;
}

export function ServicesList({ services, id }: ServicesListProps) {
  if (!services.length) return null;

  return (
    <div id={id} className="text hide-for-small">
      {services.map((service, idx) => {
        const isLast = idx === services.length - 1;
        const num = String(idx + 1).padStart(2, '0');

        return (
          <div
            key={service.id}
            className={`text dich_vu ${isLast ? 'dich_vu_last' : ''}`.trim()}
          >
            <p className="num_dv">
              <span>{num}</span>
            </p>

            <p className="name_dv">
              {service.title}
              <br />
              {service.subServices.map((sub) => (
                <span key={sub.href}>
                  <a href={sub.href}>{sub.label}</a>
                </span>
              ))}
            </p>

            <p className="mta_dv">{service.homeSummary}</p>

            <p className="nut_xthem">
              <a href={service.arrowHref}>→</a>
            </p>
          </div>
        );
      })}
    </div>
  );
}
