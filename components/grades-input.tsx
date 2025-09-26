"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Download, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/app/page";

interface GradesInputProps {
  student: Student;
  onSave: (student: Student) => void;
}

interface Grade {
  subject: string;
  grades: {
    [gradeLevel: string]: {
      semester1: number;
      semester2: number;
      yearAvg: number;
      total: number;
    };
  };
}

interface ConductData {
  [gradeLevel: string]: {
    semester1: string;
    semester2: string;
    yearAvg: string;
  };
}

export function GradesInput({ student, onSave }: GradesInputProps) {
  console.log("[v0] GradesInput component loaded for student:", student?.name);
  console.log("[v0] Student grades data:", student?.grades);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editableTotals, setEditableTotals] = useState<{ [key: string]: any }>(
    {}
  );
  const [conduct, setConduct] = useState<ConductData>({});

  const getGradeLevels = (template: string): string[] => {
    switch (template) {
      case "G9-G12":
        return ["G9", "G10", "G11", "G12"];
      case "G10-G12":
        return ["G10", "G11", "G12"];
      case "G11-G12":
        return ["G11", "G12"];
      case "G12":
        return ["G12"];
      default:
        return ["G12"];
    }
  };

  const initializeGrades = (): Grade[] => {
    console.log("[v0] Initializing grades for template:", student?.template);

    if (!student || !student.template) {
      console.log("[v0] No student or template found, returning empty grades");
      return [];
    }

    const gradeLevels = getGradeLevels(student.template);
    console.log("[v0] Grade levels for template:", gradeLevels);

    const initialConduct: ConductData = {};
    gradeLevels.forEach((level) => {
      initialConduct[level] = {
        semester1: "A",
        semester2: "A",
        yearAvg: "A",
      };
    });
    setConduct(initialConduct);

    return PREDEFINED_SUBJECTS.map((subject) => {
      const existingGrade = student.grades?.find((g) => g.subject === subject);
      const grades: { [gradeLevel: string]: any } = {};

      gradeLevels.forEach((level) => {
        grades[level] = existingGrade?.grades?.[level] || {
          semester1: 0,
          semester2: 0,
          yearAvg: 0,
          total: 0,
        };
      });

      return {
        subject,
        grades,
      };
    });
  };

  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    console.log("[v0] useEffect triggered, student changed:", student?.name);
    try {
      const initializedGrades = initializeGrades();
      console.log(
        "[v0] Initialized grades:",
        initializedGrades.length,
        "subjects"
      );
      setGrades(initializedGrades);
    } catch (error) {
      console.error("[v0] Error initializing grades:", error);
      setGrades([]);
    }
  }, [student]);

  const calculateYearAvg = (sem1: number, sem2: number): number => {
    if (sem1 === 0 && sem2 === 0) return 0;
    if (sem1 === 0) return Number(sem2.toFixed(2));
    if (sem2 === 0) return Number(sem1.toFixed(2));
    return Number(((sem1 + sem2) / 2).toFixed(2));
  };

  const validateGrade = (value: string): number => {
    const numValue = Number.parseFloat(value) || 0;
    return Math.min(Math.max(numValue, 0), 100); // Limit between 0 and 100
  };

  type GradeField = "semester1" | "semester2" | "yearAvg" | "total";
  
  const updateGrade = (
    subjectIndex: number,
    gradeLevel: string,
    field: GradeField,
    value: string | number
  ) => {
    console.log("[v0] Updating grade:", subjectIndex, gradeLevel, field, value);
  
    setGrades((prev) => {
      const updated = [...prev];
  
      if (subjectIndex < 0 || subjectIndex >= updated.length) {
        console.error("[v0] Invalid subject index:", subjectIndex);
        return prev;
      }
  
      const numValue = typeof value === "string" ? validateGrade(value) : value;
      updated[subjectIndex].grades[gradeLevel][field] = numValue;
  
      const sem1 = updated[subjectIndex].grades[gradeLevel].semester1;
      const sem2 = updated[subjectIndex].grades[gradeLevel].semester2;
      updated[subjectIndex].grades[gradeLevel].yearAvg = calculateYearAvg(
        sem1,
        sem2
      );
      updated[subjectIndex].grades[gradeLevel].total = Number(
        (sem1 + sem2).toFixed(2)
      );
  
      return updated;
    });
  };

  const updateEditableTotal = (
    gradeLevel: string,
    field: string,
    value: string
  ) => {
    const numValue = Number.parseFloat(value) || 0;
    setEditableTotals((prev) => ({
      ...prev,
      [`${gradeLevel}-${field}`]: numValue,
    }));
  };

  const calculateGradeLevelTotals = (gradeLevel: string) => {
    const totals = {
      semester1: 0,
      semester2: 0,
      yearAvg: 0,
      total: 0,
    };

    let subjectCount = 0;

    grades.forEach((grade) => {
      const gradeData = grade.grades[gradeLevel];
      if (gradeData && (gradeData.semester1 > 0 || gradeData.semester2 > 0)) {
        totals.semester1 += gradeData.semester1;
        totals.semester2 += gradeData.semester2;
        totals.yearAvg += gradeData.yearAvg;
        totals.total += gradeData.total;
        subjectCount++;
      }
    });

    const finalTotals = {
      semester1:
        editableTotals[`${gradeLevel}-semester1-total`] ??
        Number(totals.semester1.toFixed(2)),
      semester2:
        editableTotals[`${gradeLevel}-semester2-total`] ??
        Number(totals.semester2.toFixed(2)),
      yearAvg:
        editableTotals[`${gradeLevel}-yearAvg-total`] ??
        Number(totals.yearAvg.toFixed(2)),
      total:
        editableTotals[`${gradeLevel}-total-total`] ??
        Number(totals.total.toFixed(2)),
      semester1Avg:
        editableTotals[`${gradeLevel}-semester1-avg`] ??
        (subjectCount > 0
          ? Number((totals.semester1 / subjectCount).toFixed(2))
          : 0),
      semester2Avg:
        editableTotals[`${gradeLevel}-semester2-avg`] ??
        (subjectCount > 0
          ? Number((totals.semester2 / subjectCount).toFixed(2))
          : 0),
      yearAvgAvg:
        editableTotals[`${gradeLevel}-yearAvg-avg`] ??
        (subjectCount > 0
          ? Number((totals.yearAvg / subjectCount).toFixed(2))
          : 0),
      subjectCount,
    };

    return finalTotals;
  };

  const PREDEFINED_SUBJECTS = [
    "Amharic",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "History",
    "Civics",
    "Economics",
    "Agriculture",
    "HPE",
    "ICT",
  ];

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    gradeLevel: string,
    field: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      updateGrade(index, gradeLevel, field as GradeField, value);

      const nextIndex = index + 1;
      if (nextIndex < grades.length) {
        const nextInputKey = `${gradeLevel}-${nextIndex}-${field}`;
        const nextInput = inputRefs.current[nextInputKey];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

 

  const updateConduct = (gradeLevel: string, field: string, value: string) => {
    setConduct((prev) => ({
      ...prev,
      [gradeLevel]: {
        ...prev[gradeLevel],
        [field]: value,
      },
    }));
  };

  const handleSave = (isPartial: boolean) => {
    setIsSaving(true);

    const updatedStudent = {
      ...student,
      grades,
      conduct: conduct,
    };
    onSave(updatedStudent);
    setIsSaving(false);
console.log(updatedStudent)
    // Show Grade Saved popup
    const popup = document.createElement("div");
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #22c55e;
        border-radius: 8px;
        padding: 20px 40px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: #16a34a;
        text-align: center;
      ">
        ✓ Grade Saved
      </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
    }, 2000);
  };

  if (!student) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No student selected</p>
        </CardContent>
      </Card>
    );
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading grades...</p>
        </CardContent>
      </Card>
    );
  }

  const gradeLevels = getGradeLevels(student.template);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grades for {student.name}</span>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Template: {student.template}
            </div>
            
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {gradeLevels.map((gradeLevel) => {
          const levelTotals = calculateGradeLevelTotals(gradeLevel);

          return (
            <div key={gradeLevel} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {gradeLevel} Academic Record
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Subject</TableHead>
                      <TableHead className="text-center">Sem 1</TableHead>
                      <TableHead className="text-center">Sem 2</TableHead>
                      <TableHead className="text-center">Year Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade, index) => (
                      <TableRow key={`${gradeLevel}-${grade.subject}`}>
                        <TableCell className="font-medium">
                          {grade.subject}
                        </TableCell>
                        <TableCell>
                          <Input
                            ref={(el) => {
                              inputRefs.current[
                                `${gradeLevel}-${index}-semester1`
                              ] = el;
                            }}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.semester1 || ""}
                            onChange={(e) =>
                              updateGrade(
                                index,
                                gradeLevel,
                                "semester1",
                                e.target.value
                              )
                            }
                            onKeyPress={(e) =>
                              handleKeyPress(e, index, gradeLevel, "semester1")
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            ref={(el) => {
                              inputRefs.current[
                                `${gradeLevel}-${index}-semester2`
                              ] = el;
                            }}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.semester2 || ""}
                            onChange={(e) =>
                              updateGrade(
                                index,
                                gradeLevel,
                                "semester2",
                                e.target.value
                              )
                            }
                            onKeyPress={(e) =>
                              handleKeyPress(e, index, gradeLevel, "semester2")
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={grade.grades[gradeLevel]?.yearAvg || ""}
                            onChange={(e) =>
                              updateGrade(
                                index,
                                gradeLevel,
                                "yearAvg",
                                e.target.value
                              )
                            }
                            className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold"
                            placeholder="0.00"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow className="bg-muted/50 font-semibold border-t-2">
                      <TableCell className="font-bold">TOTALS</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.semester1}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "semester1-total",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.semester2}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "semester2-total",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.yearAvg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "yearAvg-total",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-50 font-semibold">
                      <TableCell className="font-bold">AVERAGES</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.semester1Avg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "semester1-avg",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.semester2Avg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "semester2-avg",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={levelTotals.yearAvgAvg}
                          onChange={(e) =>
                            updateEditableTotal(
                              gradeLevel,
                              "yearAvg-avg",
                              e.target.value
                            )
                          }
                          className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent"
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-green-50 font-semibold">
                      <TableCell className="font-bold">CONDUCT</TableCell>
                      <TableCell>
                        <Select
                          value={conduct[gradeLevel]?.semester1 || "A"}
                          onValueChange={(value) =>
                            updateConduct(gradeLevel, "semester1", value)
                          }
                        >
                          <SelectTrigger className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={conduct[gradeLevel]?.semester2 || "A"}
                          onValueChange={(value) =>
                            updateConduct(gradeLevel, "semester2", value)
                          }
                        >
                          <SelectTrigger className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={conduct[gradeLevel]?.yearAvg || "A"}
                          onValueChange={(value) =>
                            updateConduct(gradeLevel, "yearAvg", value)
                          }
                        >
                          <SelectTrigger className="text-center border-0 p-2 focus:ring-1 font-mono font-semibold bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save All Grades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
