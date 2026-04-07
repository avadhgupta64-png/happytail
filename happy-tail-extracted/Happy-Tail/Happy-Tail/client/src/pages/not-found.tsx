import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white border-2 border-dashed border-gray-200 shadow-none">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-gray-800">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold font-display">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 font-body">
            Uh oh! Looks like you've wandered off the trail. This page doesn't exist.
          </p>

          <Link href="/">
            <button className="mt-8 w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Return Home
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
