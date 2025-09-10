"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const UserDetailsSkeleton = () => {
  return (
    <Card className="max-w-md mx-auto p-4 space-y-4 shadow-none border-none">
      <CardHeader>
        <CardTitle className="font-bold">
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-64" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserDetailsSkeleton;
