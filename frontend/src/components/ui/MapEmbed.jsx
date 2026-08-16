const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14130.437487983581!2d68.8364329!3d27.6984657!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935d50016e21a63%3A0x1f28f8e4bc17299a!2sDream%20Palace%20Marquee!5e0!3m2!1sen!2s!4v1786919163714!5m2!1sen!2s';

/**
 * MapEmbed — Google Maps iframe for "Visit our office" (Dream Palace Marquee, Sukkur).
 * Renders as a rounded rectangle; `tall` makes it ~half screen height on desktop.
 */
export function MapEmbed({ className = '', tall = false, title = 'DreamEvents office location' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border-default bg-surface-raised shadow-sm ${
        tall ? 'aspect-[16/9] h-auto md:aspect-auto md:h-[50vh] lg:h-[60vh]' : 'h-56'
      } ${className}`}
    >
      <iframe
        title={title}
        src={MAP_SRC}
        className="h-full w-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
