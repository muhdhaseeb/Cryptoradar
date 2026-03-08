"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Crypto<span className="text-blue-400">Radar</span>
            </span>
          </Link>

          {/* User Button */}
          <div className="flex items-center gap-4">
            <UserButton />
          </div>

        </div>
      </div>
    </nav>
  );
}