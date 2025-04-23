import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function InternalServerError() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center text-center p-4">
      <div className=" shadow-lg rounded-2xl p-6 max-w-sm w-full">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto" />
        <h2 className="text-xl font-semibold mt-4 text-red-600">
          500 - Internal Server Error
        </h2>
        <p className="text-gray-500 mt-2 dark:text-gray-300">
          Oops! Something went wrong on our end. Please try again later.
        </p>
        <Link to="/">
          <Button className="mt-4 w-full bg-gray-900 text-white hover:cursor-pointer dark:bg-gray-950">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
