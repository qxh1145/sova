export interface ContactMapProps {
  embedUrl?: string | null;
  title: string;
}

export function ContactMap({ embedUrl, title }: ContactMapProps) {
  if (!embedUrl) return null;

  return (
    <div className="if-black">
      <iframe
        style={{ border: 0 }}
        src={embedUrl}
        width="100%"
        height={500}
        allowFullScreen
        loading="lazy"
        title={title}
      />
    </div>
  );
}
