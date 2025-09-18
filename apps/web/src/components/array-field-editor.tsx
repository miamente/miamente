"use client";
import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface ArrayFieldEditorProps {
  name: "certifications" | "languages" | "therapyApproaches";
  title: string;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

export function ArrayFieldEditor({
  name,
  title,
  placeholder,
  icon,
  disabled = false,
}: ArrayFieldEditorProps) {
  const { control } = useFormContext();
  const [newItem, setNewItem] = useState("");

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const addItem = () => {
    if (newItem.trim()) {
      append(newItem.trim());
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="button" onClick={addItem} disabled={disabled || !newItem.trim()} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Display items */}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {typeof field === "string" ? field : String(field)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={disabled}
                className="h-8 w-8 p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay elementos agregados
          </p>
        )}
      </CardContent>
    </Card>
  );
}
