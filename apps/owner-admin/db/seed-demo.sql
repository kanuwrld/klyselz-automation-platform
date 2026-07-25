-- Optional demo data. Run with: npm run db:init -- --with-demo

INSERT INTO leads (name, contact, channel, message, status, source) VALUES
  ('Anna', '@demo_anna', 'Instagram', 'Ist am Samstag ein Termin frei?', 'booked', 'demo'),
  ('Igor', '+49 000 000000', 'WhatsApp', 'Was kostet der Service?', 'qualified', 'demo'),
  ('Maria', 'maria@example.com', 'Website', 'Arbeiten Sie am Sonntag?', 'new', 'demo')
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_name, service, slot_at, status) VALUES
  ('Anna', 'Maniküre', now() + interval '1 day', 'confirmed'),
  ('Peter', 'Haarschnitt', now() + interval '2 day', 'pending')
ON CONFLICT DO NOTHING;
