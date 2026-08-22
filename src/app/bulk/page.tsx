'use client';

import React from 'react';
import { BulkOperations } from '@/features/contracts/BulkOperations';

export default function BulkPage() {
  return (
    <div className="space-y-6">
      <BulkOperations />
    </div>
  );
}
