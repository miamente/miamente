"use client";

import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Star } from "lucide-react";

interface ModalityCardTriggerProps {
  readonly isOpen: boolean;
}

export function ModalityCardTrigger({ isOpen }: ModalityCardTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <CardHeader className="group cursor-pointer py-6 transition-colors duration-200 hover:bg-purple-50/30">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600 transition-colors group-hover:text-purple-700" />
            Modalidades de Intervención
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
          )}
        </CardTitle>
      </CardHeader>
    </CollapsibleTrigger>
  );
}
