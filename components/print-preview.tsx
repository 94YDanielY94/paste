"use client";

import React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Eye, EyeOff } from "lucide-react";
import type { Student } from "@/app/page";
import { WordExport } from "@/components/word-export";

interface PrintPreviewProps {
  student: Student;
}

export function PrintPreview({ student }: PrintPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);

  const handlePrint = () => {
    window.print();
  };

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

  const getGradeLevel = (template: string) => {
    switch (template) {
      case "G9-G12":
        return "Grades 9-12";
      case "G10-G12":
        return "Grades 10-12";
      case "G11-G12":
        return "Grades 11-12";
      case "G12":
        return "Grade 12";
      default:
        return template;
    }
  };

  const getGradeData = (subject: any, gradeLevel: string) => {
    if (!subject || !subject.grades || !subject.grades[gradeLevel]) {
      return { semester1: 0, semester2: 0, yearAvg: 0, total: 0 };
    }
    return subject.grades[gradeLevel];
  };

  const getConductData = (gradeLevel: string) => {
    if (!student.conduct || !student.conduct[gradeLevel]) {
      return { semester1: "A", semester2: "A", yearAvg: "A" };
    }
    return student.conduct[gradeLevel];
  };

  const calculateTotals = (gradeLevel: string) => {
    let sem1Total = 0,
      sem2Total = 0,
      yearAvgTotal = 0,
      subjectCount = 0;

    student.grades?.forEach((subject) => {
      const gradeData = getGradeData(subject, gradeLevel);
      if (gradeData.semester1 > 0 || gradeData.semester2 > 0) {
        sem1Total += gradeData.semester1;
        sem2Total += gradeData.semester2;
        yearAvgTotal += gradeData.yearAvg;
        subjectCount++;
      }
    });

    return {
      sem1Total: sem1Total.toFixed(1),
      sem2Total: sem2Total.toFixed(1),
      yearAvgTotal: yearAvgTotal.toFixed(1),
      sem1Avg: subjectCount > 0 ? (sem1Total / subjectCount).toFixed(1) : "0.0",
      sem2Avg: subjectCount > 0 ? (sem2Total / subjectCount).toFixed(1) : "0.0",
      yearAvgAvg:
        subjectCount > 0 ? (yearAvgTotal / subjectCount).toFixed(1) : "0.0",
      subjectCount,
    };
  };

  const gradeLevels = getGradeLevels(student.template);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transcript Preview & Export</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print Transcript
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Preview your transcript before printing or exporting. The layout is
            optimized for landscape orientation.
          </div>
        </CardContent>
      </Card>

      {/* Word Export Component */}
      <WordExport student={student} />

      {/* Print Preview */}
      {showPreview && (
        <div className="print-container border">
          <div
            className="transcript-page bg-white text-black shadow-lg mx-auto flex flex-col"
            style={{
              width: "100%",
              height: "6.58in",
              aspectRatio: "16/9",
              minHeight: "6.58in",
              maxWidth: "100%",
              maxHeight: "100%",
              padding: "0in",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Header - Compact */}
            <div className="text-center mb-3 border-b-2 border-black pb-2">
              <h1 className="text-xl font-bold mb-1">OFFICIAL TRANSCRIPT</h1>
              <div className="text-sm">Academic Record</div>
            </div>

            {/* Student Information - Horizontal Layout */}
            <div className="mb-3 p-2 border border-gray-400 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    <span className="font-bold">{student.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Gender:</span>{" "}
                    {student.gender}
                  </div>
                  <div>
                    <span className="font-semibold">Age:</span> {student.age}
                  </div>
                  <div>
                    <span className="font-semibold">Program:</span>{" "}
                    {getGradeLevel(student.template)}
                  </div>
                </div>
                <div className="w-12 h-16 border border-gray-400 flex items-center justify-center bg-gray-50 text-xs text-gray-500">
                  Photo
                </div>
              </div>
            </div>

            <div className="border border-black">
              <div className="bg-gray-200 p-2 text-center font-bold text-sm border-b border-black">
                ACADEMIC RECORD - {getGradeLevel(student.template)}
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-left font-bold w-32">
                      SUBJECT
                    </th>
                    {gradeLevels.map((gradeLevel) => (
                      <th
                        key={gradeLevel}
                        className="border border-black p-1 text-center font-bold"
                        colSpan={3}
                      >
                        {gradeLevel}
                        {gradeLevel === "G11" &&
                          gradeLevels.includes("G12") && (
                            <div className="text-xs text-green-700 font-normal">
                              → PROMOTED TO G12
                            </div>
                          )}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-black p-1"></th>
                    {gradeLevels.map((gradeLevel) => (
                      <React.Fragment key={gradeLevel}>
                        <th className="border border-black p-1 text-center font-bold text-xs">
                          SEM1
                        </th>
                        <th className="border border-black p-1 text-center font-bold text-xs">
                          SEM2
                        </th>
                        <th className="border border-black p-1 text-center font-bold text-xs">
                          YR AVG
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {student.grades?.map((subject, subjectIndex) => (
                    <tr
                      key={subjectIndex}
                      className={
                        subjectIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      <td className="border border-black p-1 font-medium text-xs">
                        {subject.subject}
                      </td>
                      {gradeLevels.map((gradeLevel) => {
                        const gradeData = getGradeData(subject, gradeLevel);
                        return (
                          <React.Fragment key={gradeLevel}>
                            <td className="border border-black p-1 text-center font-mono text-xs">
                              {gradeData.semester1 > 0
                                ? gradeData.semester1.toFixed(1)
                                : "-"}
                            </td>
                            <td className="border border-black p-1 text-center font-mono text-xs">
                              {gradeData.semester2 > 0
                                ? gradeData.semester2.toFixed(1)
                                : "-"}
                            </td>
                            <td className="border border-black p-1 text-center font-mono font-bold text-xs">
                              {gradeData.yearAvg > 0
                                ? gradeData.yearAvg.toFixed(1)
                                : "-"}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Totals Row */}
                  <tr className="bg-yellow-100 font-bold">
                    <td className="border border-black p-1 font-bold text-xs">
                      TOTALS
                    </td>
                    {gradeLevels.map((gradeLevel) => {
                      const totals = calculateTotals(gradeLevel);
                      return (
                        <React.Fragment key={gradeLevel}>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.sem1Total}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.sem2Total}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.yearAvgTotal}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Averages Row */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-black p-1 font-bold text-xs">
                      AVERAGES
                    </td>
                    {gradeLevels.map((gradeLevel) => {
                      const totals = calculateTotals(gradeLevel);
                      return (
                        <React.Fragment key={gradeLevel}>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.sem1Avg}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.sem2Avg}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {totals.yearAvgAvg}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Conduct Row */}
                  <tr className="bg-green-100 font-bold">
                    <td className="border border-black p-1 font-bold text-xs">
                      CONDUCT
                    </td>
                    {gradeLevels.map((gradeLevel) => {
                      const conduct = getConductData(gradeLevel);
                      return (
                        <React.Fragment key={gradeLevel}>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {conduct.semester1}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {conduct.semester2}
                          </td>
                          <td className="border border-black p-1 text-center font-mono text-xs">
                            {conduct.yearAvg}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .transcript-page,
          .transcript-page * {
            visibility: visible;
          }
          .transcript-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0.2in !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
          @page {
            size: 11.7in 6.58in;
            margin: 0.2in;
          }
        }
        .print-container {
          overflow-x: auto;
        }
        .transcript-page {
          font-family: "Arial", sans-serif;
          line-height: 1.1;
          width: 11.7in;
          height: 6.58in;
          aspect-ratio: 16/9;
          min-height: 6.58in;
          max-width: 100vw;
          max-height: 100vh;
          padding: 0.5in;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .transcript-page table {
          font-size: 0.85em;
          table-layout: fixed;
          width: 100%;
          word-break: break-all;
        }
        .transcript-page th,
        .transcript-page td {
          padding: 0.15em 0.3em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
