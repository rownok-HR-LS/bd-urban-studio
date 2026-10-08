import { CalendarClock } from 'lucide-react';

import { Card } from '../components/ui';
import { usePrefs } from '../lib/prefs';

export function ComingSoon({ title }: { title: string }) {
  const { t } = usePrefs();
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-sun-soft text-warning">
        <CalendarClock size={22} />
      </span>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{t((d) => d.admin.comingSoon.body)}</p>
    </Card>
  );
}
