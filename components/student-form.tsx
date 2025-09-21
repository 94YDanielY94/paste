"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student } from "@/app/page"

interface StudentFormProps {
  student: Student | null
  onSave: (student: Student) => void
}

export function StudentForm({ student, onSave }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    gender: "" as "Male" | "Female" | "",
    age: "",
    template: "G9-G12" as Student["template"],
  })

  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        gender: student.gender,
        age: student.age.toString(),
        template: student.template,
      })
    } else {
      setFormData({
        name: "",
        gender: "",
        age: "",
        template: "G9-G12",
      })
    }
  }, [student])

  const validateAndCapitalizeName = (name: string): { isValid: boolean; capitalizedName: string; error: string } => {
    const trimmedName = name.trim()

    // Check if name has at least 3 parts (first, middle, last)
    const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0)

    if (nameParts.length < 3) {
      return {
        isValid: false,
        capitalizedName: trimmedName,
        error: "Please enter full name (First Middle Last)",
      }
    }

    // Check if each part contains only letters
    const nameRegex = /^[a-zA-Z]+$/
    const invalidParts = nameParts.filter((part) => !nameRegex.test(part))

    if (invalidParts.length > 0) {
      return {
        isValid: false,
        capitalizedName: trimmedName,
        error: "Name should contain only letters",
      }
    }

    // Capitalize each part
    const capitalizedName = nameParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")

    return {
      isValid: true,
      capitalizedName,
      error: "",
    }
  }

  const getAgeRestrictions = (template: Student["template"]): { min: number; max: number; schoolType: string } => {
    switch (template) {
      case "G9-G12":
        return { min: 14, max: 19, schoolType: "High School (4 years)" }
      case "G10-G12":
        return { min: 15, max: 18, schoolType: "High School (3 years)" }
      case "G11-G12":
        return { min: 16, max: 18, schoolType: "High School (2 years)" }
      case "G12":
        return { min: 17, max: 19, schoolType: "Grade 12 Only" }
      default:
        return { min: 14, max: 19, schoolType: "High School" }
    }
  }

  const calculateAcademicYears = (template: Student["template"]): string => {
    const currentYear = new Date().getFullYear()
    const templateYears = {
      "G9-G12": 4,
      "G10-G12": 3,
      "G11-G12": 2,
      G12: 1,
    }
    const years = templateYears[template]
    const startYear = currentYear - years + 1
    return `${startYear}-${currentYear}`
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.value
    setFormData((prev) => ({ ...prev, name: inputName }))

    if (inputName.trim()) {
      const validation = validateAndCapitalizeName(inputName)
      setNameError(validation.error)
    } else {
      setNameError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.gender || !formData.age) {
      alert("Please fill in all fields")
      return
    }

    const nameValidation = validateAndCapitalizeName(formData.name)
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error)
      return
    }

    const ageRestrictions = getAgeRestrictions(formData.template)
    const age = Number.parseInt(formData.age)
    if (age < ageRestrictions.min || age > ageRestrictions.max) {
      alert(`Age must be between ${ageRestrictions.min} and ${ageRestrictions.max} for ${ageRestrictions.schoolType}`)
      return
    }

    const studentData: Student = {
      id: student?.id || Date.now().toString(),
      name: nameValidation.capitalizedName, // Use capitalized name
      gender: formData.gender as "Male" | "Female",
      age: age,
      template: formData.template,
      grades: student?.grades || [],
    }

    onSave(studentData)
  }

  const currentAgeRestrictions = getAgeRestrictions(formData.template)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student ? `Edit ${student.name}` : "New Student Information"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter student's full name (First Middle Last)"
                required
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              <p className="text-xs text-muted-foreground">Must include first, middle, and last name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as "Male" | "Female" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                min={currentAgeRestrictions.min}
                max={currentAgeRestrictions.max}
                required
              />
              <p className="text-xs text-muted-foreground">
                Age range for {currentAgeRestrictions.schoolType}: {currentAgeRestrictions.min}-
                {currentAgeRestrictions.max} years
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Transcript Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, template: value as Student["template"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G9-G12">G9–G12 (4 years)</SelectItem>
                  <SelectItem value="G10-G12">G10–G12 (3 years)</SelectItem>
                  <SelectItem value="G11-G12">G11–G12 (2 years)</SelectItem>
                  <SelectItem value="G12">G12 only (1 year)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Academic Years (Auto-calculated)</Label>
            <div className="p-3 bg-muted rounded-lg">
              <span className="font-mono">{calculateAcademicYears(formData.template)}</span>
              <p className="text-sm text-muted-foreground mt-1">
                Based on current year ({new Date().getFullYear()}) and selected template
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {student ? "Update Student" : "Save Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
