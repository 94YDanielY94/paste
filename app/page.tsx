"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentForm } from "@/components/student-form";
import { GradesInput } from "@/components/grades-input";
import { DataManager } from "@/components/data-manager";
import { PrintPreview } from "@/components/print-preview";
import { FileManager } from "@/lib/file-manager";
import {
  FileText,
  Users,
  Download,
  Upload,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";

export interface Student {
  id: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
  academicYears?: string;
  template: "G9-G12" | "G10-G12" | "G11-G12" | "G12";
  grades: {
    subject: string;
    grades: {
      [gradeLevel: string]: {
        semester1: number;
        semester2: number;
        yearAvg: number;
        total: number;
      };
    };
  }[];
  conduct?: {
    [gradeLevel: string]: {
      semester1: string;
      semester2: string;
      yearAvg: string;
    };
  };
}

export default function TranscriptGenerator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<
    "form" | "grades" | "preview" | "data"
  >("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const loadedStudents = await FileManager.readStudents();
        setStudents(loadedStudents);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAge =
      ageFilter === "all" || student.age.toString() === ageFilter;
    const matchesGender =
      genderFilter === "all" || student.gender === genderFilter;
    const matchesTemplate =
      templateFilter === "all" || student.template === templateFilter;

    return matchesSearch && matchesAge && matchesGender && matchesTemplate;
  });

  const addOrUpdateStudent = async (student: Student) => {
    try {
      const success = await FileManager.saveStudent(student);
      if (success) {
        // Reload students from file to ensure consistency
        const updatedStudents = await FileManager.readStudents();
        setStudents(updatedStudents);
        setCurrentStudent(student);
      } else {
        alert("Failed to save student data");
      }
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error saving student data");
    }
  };

  const selectStudent = (student: Student) => {
    console.log(
      "[v0] Selecting student:",
      student.name,
      "Gender:",
      student.gender,
      "Template:",
      student.template
    );
    setCurrentStudent(student);
    setActiveTab("form");
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const success = await FileManager.deleteStudent(studentId);
      if (success) {
        // Reload students from file
        const updatedStudents = await FileManager.readStudents();
        setStudents(updatedStudents);

        if (currentStudent?.id === studentId) {
          setCurrentStudent(null);
          setActiveTab("form");
        }
      } else {
        alert("Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Error deleting student");
    }
  };

  const createNewStudent = () => {
    setCurrentStudent(null);
    setActiveTab("form");
  };

  const handleImport = async (importedStudents: Student[]) => {
    try {
      const success = await FileManager.writeStudents(importedStudents);
      if (success) {
        setStudents(importedStudents);
      } else {
        alert("Failed to import students");
      }
    } catch (error) {
      console.error("Error importing students:", error);
      alert("Error importing students");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/icon-192.png"
              alt="Transcript Generator"
              width={48}
              height={48}
              className="rounded-sm shadow-sm"
            />
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">
                Transcript Generator
              </h1>
              <p className="text-muted-foreground">
                Create and manage student transcripts locally
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "form" ? "default" : "outline"}
            onClick={() => setActiveTab("form")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Student Info
          </Button>
          <Button
            variant={activeTab === "grades" ? "default" : "outline"}
            onClick={() => setActiveTab("grades")}
            disabled={!currentStudent}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Grades
          </Button>
          <Button
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => setActiveTab("preview")}
            disabled={!currentStudent}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Preview & Export
          </Button>
          <Button
            variant={activeTab === "data" ? "default" : "outline"}
            onClick={() => setActiveTab("data")}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Data Management
          </Button>
        </div>

        {students.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Data ({students.length} total)</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!currentStudent}
                    onClick={() => {
                      if (!currentStudent) return;
                      const exportData = {
                        student: currentStudent,
                        grades: currentStudent.grades,
                        conduct: currentStudent.conduct,
                        exportDate: new Date().toISOString(),
                      };
                      const dataStr = JSON.stringify(exportData, null, 2);
                      const dataBlob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(dataBlob);

                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${currentStudent.name.replace(
                        /\s+/g,
                        "_"
                      )}_grades_${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    title="Export selected student's data"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export Student
                  </Button>
                  <label>
                    <Input
                      type="file"
                      accept=".json"
                      className="hidden"
                      disabled={!currentStudent}
                      onChange={async (e) => {
                        if (!currentStudent) return;
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                          try {
                            const importData = JSON.parse(
                              ev.target?.result as string
                            );
                            if (!importData.student || !importData.grades) {
                              throw new Error("Invalid file format.");
                            }
                            // Update the current student in the students array
                            await addOrUpdateStudent({
                              ...currentStudent,
                              ...importData.student,
                              grades: importData.grades,
                              conduct: importData.conduct,
                            });
                            alert("Student data imported successfully!");
                          } catch (error) {
                            alert(
                              "Error importing file. Please check the file format."
                            );
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      disabled={!currentStudent}
                      title="Import data for selected student"
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-1" />
                        Import Student
                      </span>
                    </Button>
                  </label>
                  <Button onClick={createNewStudent} size="sm">
                    Add New Student
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    {Array.from(new Set(students.map((s) => s.age)))
                      .sort()
                      .map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={templateFilter}
                  onValueChange={setTemplateFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Templates</SelectItem>
                    <SelectItem value="G9-G12">G9-G12</SelectItem>
                    <SelectItem value="G10-G12">G10-G12</SelectItem>
                    <SelectItem value="G11-G12">G11-G12</SelectItem>
                    <SelectItem value="G12">G12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentStudent?.id === student.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => selectStudent(student)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.gender}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Age {student.age}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.template}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.academicYears}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Are you sure you want to delete ${student.name}?`
                          )
                        ) {
                          deleteStudent(student.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {activeTab === "form" && (
            <StudentForm student={currentStudent} onSave={addOrUpdateStudent} />
          )}

          {activeTab === "grades" && currentStudent && (
            <GradesInput student={currentStudent} onSave={addOrUpdateStudent} />
          )}

          {activeTab === "preview" && currentStudent && (
            <PrintPreview student={currentStudent} />
          )}

          {activeTab === "data" && (
            <DataManager
              students={students}
              onImport={handleImport}
              onDeleteStudent={deleteStudent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
