"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Loader2 } from "lucide-react"
import type { Student } from "@/app/page"

interface WordExportProps {
  student: Student
}

export function WordExport({ student }: WordExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToWord = async () => {
    setIsExporting(true)
    try {
      console.log("[v0] Starting Word export for student:", student.name)

      const [
        { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, BorderStyle, WidthType },
        fileSaver,
      ] = await Promise.all([import("docx"), import("file-saver")])

      const saveAs = fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default

      console.log("[v0] Libraries loaded successfully")

      const getGradeLevel = (template: string) => {
        switch (template) {
          case "G9-G12":
            return "Grades 9-12"
          case "G10-G12":
            return "Grades 10-12"
          case "G11-G12":
            return "Grades 11-12"
          case "G12":
            return "Grade 12"
          default:
            return template
        }
      }

      const getOverallAverage = () => {
        if (!student.grades || student.grades.length === 0) return 0

        let totalSum = 0
        let totalCount = 0

        student.grades.forEach((grade) => {
          if (grade.grades) {
            Object.values(grade.grades).forEach((gradeData: any) => {
              if (gradeData.yearAvg > 0) {
                totalSum += gradeData.yearAvg
                totalCount++
              }
            })
          }
        })

        return totalCount > 0 ? Math.round(totalSum / totalCount) : 0
      }

      const getGradeStatus = (average: number) => {
        if (average >= 90) return "Excellent"
        if (average >= 80) return "Good"
        if (average >= 70) return "Satisfactory"
        if (average >= 60) return "Pass"
        return "Needs Improvement"
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children: [
              // Header
              new Paragraph({
                children: [new TextRun({ text: "OFFICIAL TRANSCRIPT", bold: true, size: 32 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [new TextRun({ text: "Academic Record", size: 24 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              // Student Information
              new Paragraph({
                children: [new TextRun({ text: "STUDENT INFORMATION", bold: true, size: 24 })],
                spacing: { after: 200 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Name:", bold: true })] })],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: student.name, bold: true, size: 24 })] }),
                        ],
                        width: { size: 80, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Gender:", bold: true })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: student.gender })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Age:", bold: true })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: student.age.toString() })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Academic Years:", bold: true })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: student.academicYears })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Program:", bold: true })] })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: getGradeLevel(student.template) })] }),
                        ],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              }),

              // Academic Record
              new Paragraph({
                children: [new TextRun({ text: "ACADEMIC RECORD", bold: true, size: 24 })],
                spacing: { before: 400, after: 200 },
              }),

              ...Object.keys(student.grades?.[0]?.grades || {}).flatMap((gradeLevel) => [
                new Paragraph({
                  children: [new TextRun({ text: `${gradeLevel} Academic Record`, bold: true, size: 20 })],
                  spacing: { before: 300, after: 100 },
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "SUBJECT", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "SEM 1", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "SEM 2", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "YEAR AVG", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "TOTAL", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "CONDUCT", bold: true })],
                              alignment: AlignmentType.CENTER,
                            }),
                          ],
                        }),
                      ],
                    }),
                    ...(student.grades || []).map(
                      (grade) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({ children: [new TextRun({ text: grade.subject, bold: true })] }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text:
                                        grade.grades[gradeLevel]?.semester1 > 0
                                          ? `${grade.grades[gradeLevel].semester1}%`
                                          : "-",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text:
                                        grade.grades[gradeLevel]?.semester2 > 0
                                          ? `${grade.grades[gradeLevel].semester2}%`
                                          : "-",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text:
                                        grade.grades[gradeLevel]?.yearAvg > 0
                                          ? `${grade.grades[gradeLevel].yearAvg}%`
                                          : "-",
                                      bold: true,
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text:
                                        grade.grades[gradeLevel]?.total > 0
                                          ? grade.grades[gradeLevel].total.toString()
                                          : "-",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [new TextRun({ text: grade.grades[gradeLevel]?.conduct || "-" })],
                                  alignment: AlignmentType.CENTER,
                                }),
                              ],
                            }),
                          ],
                        }),
                    ),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                  },
                }),
              ]),

              // Academic Summary
              new Paragraph({
                children: [new TextRun({ text: "ACADEMIC SUMMARY", bold: true, size: 24 })],
                spacing: { before: 400, after: 200 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Total Subjects:", bold: true })] })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: (student.grades?.length || 0).toString() })],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Overall Average:", bold: true })] }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: `${getOverallAverage()}%`, bold: true, size: 24 })],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Academic Status:", bold: true })] }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: getGradeStatus(getOverallAverage()), bold: true })],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              }),

              // Footer
              new Paragraph({
                children: [new TextRun({ text: `Generated on: ${new Date().toLocaleDateString()}`, italics: true })],
                spacing: { before: 400 },
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: `Document ID: ${student.id}`, italics: true, size: 16 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          },
        ],
      })

      console.log("[v0] Document created, generating blob...")

      const blob = await Packer.toBlob(doc)
      const fileName = `${student.name.replace(/[^a-zA-Z0-9]/g, "_")}_${student.template}.docx`

      console.log("[v0] Blob generated, saving file:", fileName)

      saveAs(blob, fileName)

      console.log("[v0] File saved successfully")
      alert("Word document exported successfully!")
    } catch (error) {
      console.error("[v0] Error exporting to Word:", error)
      alert(`Failed to export to Word document: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

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
            Generate a professional Word document (.docx) of the transcript with proper formatting and tables.
          </div>

          <Button
            onClick={exportToWord}
            disabled={isExporting || !student.grades || student.grades.length === 0}
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
  )
}
