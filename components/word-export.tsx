"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
} from "docx";
import type { Student } from "@/app/page";

interface WordExportProps {
  student: Student;
}

export function WordExport({ student }: WordExportProps) {
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToWord = async () => {
    setIsExporting(true);
    try {
      // Table header rows
      const headerRow1 = [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "SUBJECT", bold: true })],
            }),
          ],
          rowSpan: 2,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        ...gradeLevels.flatMap((gradeLevel) => [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: gradeLevel, bold: true })],
              }),
            ],
            columnSpan: 3,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
        ]),
      ];

      const headerRow2 = [
        ...gradeLevels.flatMap(() => [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "SEM1", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "SEM2", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "YR AVG", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
        ]),
      ];

      // Subject rows
      const subjectRows = student.grades.map(
        (subject) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: subject.subject, bold: true }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              ...gradeLevels.flatMap((gradeLevel) => {
                const gradeData = getGradeData(subject, gradeLevel);
                return [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text:
                          gradeData.semester1 > 0
                            ? gradeData.semester1.toFixed(1)
                            : "-",
                      }),
                    ],
                    borders: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      left: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      right: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                    },
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text:
                          gradeData.semester2 > 0
                            ? gradeData.semester2.toFixed(1)
                            : "-",
                      }),
                    ],
                    borders: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      left: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      right: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                    },
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text:
                          gradeData.yearAvg > 0
                            ? gradeData.yearAvg.toFixed(1)
                            : "-",
                      }),
                    ],
                    borders: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      left: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                      right: {
                        style: BorderStyle.SINGLE,
                        size: 1,
                        color: "000000",
                      },
                    },
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                ];
              }),
            ],
          })
      );

      // Totals, Averages, Conduct rows
      const totalsRow = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "TOTALS", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          ...gradeLevels.flatMap((gradeLevel) => {
            const totals = calculateTotals(gradeLevel);
            return [
              new TableCell({
                children: [new Paragraph({ text: totals.sem1Total })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: totals.sem2Total })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: totals.yearAvgTotal })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
            ];
          }),
        ],
      });

      const averagesRow = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "AVERAGES", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          ...gradeLevels.flatMap((gradeLevel) => {
            const totals = calculateTotals(gradeLevel);
            return [
              new TableCell({
                children: [new Paragraph({ text: totals.sem1Avg })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: totals.sem2Avg })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: totals.yearAvgAvg })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
            ];
          }),
        ],
      });

      const conductRow = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "CONDUCT", bold: true })],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          ...gradeLevels.flatMap((gradeLevel) => {
            const conduct = getConductData(gradeLevel);
            return [
              new TableCell({
                children: [new Paragraph({ text: conduct.semester1 })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: conduct.semester2 })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: conduct.yearAvg })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "000000",
                  },
                },
                width: { size: 10, type: WidthType.PERCENTAGE },
              }),
            ];
          }),
        ],
      });

      // Build the document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: "landscape",
                  width: 16838, // 11.7in in twips
                  height: 9417, // 6.58in in twips
                },
                margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5in
              },
            },
            children: [
              new Paragraph({
                text: "OFFICIAL TRANSCRIPT",
                heading: "Heading1",
                alignment: "center",
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: "Academic Record",
                alignment: "center",
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Name: `, bold: true }),
                  new TextRun({ text: student.name }),
                  new TextRun({ text: `    Gender: `, bold: true }),
                  new TextRun({ text: student.gender }),
                  new TextRun({ text: `    Age: `, bold: true }),
                  new TextRun({ text: String(student.age) }),
                  new TextRun({ text: `    Program: `, bold: true }),
                  new TextRun({ text: getGradeLevel(student.template) }),
                ],
                spacing: { after: 200 },
              }),
              new Table({
                rows: [
                  new TableRow({ children: headerRow1 }),
                  new TableRow({
                    children: [new TableCell({ children: [] }), ...headerRow2],
                  }),
                  ...subjectRows,
                  totalsRow,
                  averagesRow,
                  conductRow,
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [
                  2000,
                  ...Array(gradeLevels.length * 3).fill(1200),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Authorized Signature", break: 1 }),
                ],
                spacing: { before: 400, after: 100 },
                alignment: "center",
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${student.name.replace(/\s+/g, "_")}_transcript.docx`);
      alert("Word document exported successfully!");
    } catch (error) {
      console.error("[v0] Error exporting to Word:", error);
      alert(
        `Failed to export to Word document: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Export to Word Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Generate a professional Word document (.docx) of the transcript with
            proper formatting and tables.
          </div>

          <Button
            onClick={exportToWord}
            disabled={
              isExporting || !student.grades || student.grades.length === 0
            }
            className="w-full flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export to Word (.docx)
              </>
            )}
          </Button>

          {(!student.grades || student.grades.length === 0) && (
            <div className="text-sm text-muted-foreground text-center">
              Add some grades first to export the transcript
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
