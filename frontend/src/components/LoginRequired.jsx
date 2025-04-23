import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function LoginRequired() {
  return (
    <div className="flex flex-col items-center justify-center  min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-5rem)] text-center p-4 ">
      <div className="shadow-lg rounded-2xl p-6 max-w-sm w-full dark:bg-gray-800">
        <h2 className="text-xl font-semibold mt-4">Access Restricted</h2>
        <p className="text-gray-500 mt-2 dark:text-gray-300">
          You need to log in first to access this content.
        </p>
        <Link to="/login">
          <Button className="mt-4 w-full bg-gray-900 text-white dark:bg-gray-950 hover:cursor-pointer">
            Login Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
