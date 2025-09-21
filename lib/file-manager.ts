import type { Student } from "@/app/page"

const STORAGE_KEY = "transcript-students"

export class FileManager {
  // Read all students from localStorage
  static async readStudents(): Promise<Student[]> {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (!savedData) {
        console.log("[v0] No saved data found, returning empty array")
        return []
      }

      const students = JSON.parse(savedData)
      console.log("[v0] Read students from localStorage:", students.length)
      return Array.isArray(students) ? students : []
    } catch (error) {
      console.error("[v0] Error reading students from localStorage:", error)
      return []
    }
  }

  // Write all students to localStorage
  static async writeStudents(students: Student[]): Promise<boolean> {
    try {
      const content = JSON.stringify(students, null, 2)
      localStorage.setItem(STORAGE_KEY, content)
      console.log("[v0] Wrote students to localStorage:", students.length)
      return true
    } catch (error) {
      console.error("[v0] Error writing students to localStorage:", error)
      return false
    }
  }

  // Add or update a student
  static async saveStudent(student: Student): Promise<boolean> {
    try {
      const students = await this.readStudents()
      const existingIndex = students.findIndex((s) => s.id === student.id)

      if (existingIndex >= 0) {
        students[existingIndex] = student
        console.log("[v0] Updated existing student:", student.name)
      } else {
        students.push(student)
        console.log("[v0] Added new student:", student.name)
      }

      return await this.writeStudents(students)
    } catch (error) {
      console.error("[v0] Error saving student:", error)
      return false
    }
  }

  // Delete a student
  static async deleteStudent(studentId: string): Promise<boolean> {
    try {
      const students = await this.readStudents()
      const filteredStudents = students.filter((s) => s.id !== studentId)

      if (filteredStudents.length === students.length) {
        console.log("[v0] Student not found for deletion:", studentId)
        return false
      }

      console.log("[v0] Deleted student:", studentId)
      return await this.writeStudents(filteredStudents)
    } catch (error) {
      console.error("[v0] Error deleting student:", error)
      return false
    }
  }

  // Export students to downloadable JSON
  static async exportStudents(): Promise<Blob | null> {
    try {
      const students = await this.readStudents()
      const content = JSON.stringify(students, null, 2)
      return new Blob([content], { type: "application/json" })
    } catch (error) {
      console.error("[v0] Error exporting students:", error)
      return null
    }
  }

  // Import students from JSON content
  static async importStudents(jsonContent: string): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const parsedData = JSON.parse(jsonContent)

      if (!Array.isArray(parsedData)) {
        return { success: false, message: "Invalid file format: Expected an array of students" }
      }

      // Validate each student object
      for (const student of parsedData) {
        if (
          !student.id ||
          !student.name ||
          !student.gender ||
          typeof student.age !== "number" ||
          !student.academicYears ||
          !student.template ||
          !student.grades
        ) {
          return { success: false, message: "Invalid student data structure" }
        }

        // Validate grades structure
        for (const grade of student.grades) {
          if (!grade.subject || !grade.grades) {
            return { success: false, message: "Invalid grades data structure" }
          }
        }
      }

      const success = await this.writeStudents(parsedData)
      if (success) {
        return {
          success: true,
          message: `Successfully imported ${parsedData.length} student(s)`,
          count: parsedData.length,
        }
      } else {
        return { success: false, message: "Failed to save imported data" }
      }
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  // Clear all student data
  static async clearAllStudents(): Promise<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log("[v0] Cleared all student data from localStorage")
      return true
    } catch (error) {
      console.error("[v0] Error clearing student data:", error)
      return false
    }
  }
}
