'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WorksheetGenerator() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Worksheet Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Worksheet generator functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
