'use client';

import React from 'react';
import { EventTimeline } from '@/features/events/EventTimeline';

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <EventTimeline />
    </div>
  );
}
