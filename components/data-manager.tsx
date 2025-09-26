"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, Trash2, AlertCircle, FileText } from "lucide-react";
import { FileManager } from "@/lib/file-manager";
import type { Student } from "@/app/page";

interface DataManagerProps {
  students: Student[];
  onImport: (students: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
}

export function DataManager({
  students,
  onImport,
  onDeleteStudent,
}: DataManagerProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadJSON = async () => {
    try {
      setIsProcessing(true);
      console.log("[v0] Starting JSON download...");

      const blob = await FileManager.exportStudents();
      if (!blob) {
        throw new Error("Failed to create export data");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transcript-data-${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log("[v0] JSON download completed");
      setImportSuccess("Data exported successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (error) {
      console.error("[v0] Error downloading JSON:", error);
      setImportError("Failed to download data");
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Ensure file type is JSON
    if (!file.name.endsWith(".json")) {
      setImportError("Please upload a valid JSON file.");
      setTimeout(() => setImportError(null), 5000);
      return;
    }

    setImportError(null);
    setImportSuccess(null);
    setIsProcessing(true);

    try {
      const content = await file.text();
      let studentsData: Student[];

      // Parse and validate JSON
      try {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed))
          throw new Error("Invalid file format: Expected an array.");
        // Optionally, add more validation here
        studentsData = parsed;
      } catch (err) {
        throw new Error("Invalid JSON structure.");
      }

      // Save to local storage (or use FileManager if it handles this)
      localStorage.setItem("students", JSON.stringify(studentsData));
      onImport(studentsData);
      setImportSuccess("Data imported successfully!");

      console.log(
        "[v0] File import completed:",
        studentsData.length,
        "students"
      );
    } catch (error) {
      console.error("[v0] Error importing file:", error);
      setImportError(
        `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        setImportError(null);
        setImportSuccess(null);
      }, 5000);
    }
  };

  const clearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to delete all student data? This action cannot be undone."
      )
    ) {
      setIsProcessing(true);
      try {
        const success = await FileManager.clearAllStudents();
        if (success) {
          onImport([]);
          setImportSuccess("All data cleared successfully");
          console.log("[v0] All data cleared");
        } else {
          setImportError("Failed to clear data");
        }
      } catch (error) {
        console.error("[v0] Error clearing data:", error);
        setImportError("Failed to clear data");
      } finally {
        setIsProcessing(false);
        setTimeout(() => {
          setImportError(null);
          setImportSuccess(null);
        }, 3000);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download all student data as JSON file
            </p>
          </div>
          <Button
            onClick={downloadJSON}
            disabled={students.length === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isProcessing ? "Exporting..." : "Download JSON"}
          </Button>
        </div>

        {/* Import */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Import Data</h3>
              <p className="text-sm text-muted-foreground">
                Upload JSON file to restore student data
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Choose File"}
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />

          {importError && (
            <Alert className="border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                {importError}
              </AlertDescription>
            </Alert>
          )}

          {importSuccess && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importSuccess}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Clear Data */}
        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div>
            <h3 className="font-semibold text-destructive">Clear All Data</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete all student records
            </p>
          </div>
          <Button
            onClick={clearAllData}
            variant="destructive"
            disabled={students.length === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isProcessing ? "Clearing..." : "Clear All"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
