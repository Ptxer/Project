"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const options = [
  { value: 1, label: "ปวดหัวเป็นไข้" },
  { value: 2, label: "ปวดท้อง" },
  { value: 3, label: "ท้องเสีย" },
  { value: 4, label: "ปวดรอบเดือน" },
  { value: 5, label: "เป็นหวัด" },
  { value: 6, label: "ปวดฟัน" },
  { value: 7, label: "เป็นแผล" },
  { value: 8, label: "เป็นลม" },
  { value: 9, label: "ตาเจ็บ" },
  { value: 10, label: "ผื่นคัน" },
  { value: 11, label: "นอนพัก" },
  { value: 12, label: "อื่นๆ" },
];

const roleOptions = [
  { value: "นักศึกษา", label: "นักศึกษา" },
  { value: "บุคลากรภายในมหาลัย", label: "บุคลากรภายในมหาลัย" },
  { value: "บุคคลภายนอก", label: "บุคคลภายนอก" }
];

export default function PatientForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const [isMounted, setIsMounted] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [role, setRole] = useState("");

  const handleSymptomChange = (selectedOptions) => {
    setSelectedSymptoms(selectedOptions ? selectedOptions.map((option) => option.value) : []);
  };

  const handleRoleChange = (selectedOption) => {
    setRole(selectedOption ? selectedOption.value : "");
    if (selectedOption?.value === "บุคคลภายนอก") {
      setStudentId(""); // clear student ID when role is "outsider"
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
  
    const symptomLabels = {
      1: "ปวดหัวเป็นไข้",
      2: "ปวดท้อง",
      3: "ท้องเสีย",
      4: "ปวดรอบเดือน",
      5: "เป็นหวัด",
      6: "ปวดฟัน",
      7: "เป็นแผล",
      8: "เป็นลม",
      9: "ตาเจ็บ",
      10: "ผื่นคัน",
      11: "นอนพัก",
      12: "อื่นๆ",
    };
  
    const sortedSymptoms = selectedSymptoms.sort((a, b) => a - b);
    const selectedSymptomLabels = sortedSymptoms
      .map((id) => symptomLabels[id] || "Unknown")
      .join(", ");
  
    const confirmMessage = `
      ยืนยันข้อมูล:
      ชื่อ-นามสกุล: ${studentName}
      รหัสนักศึกษา: ${studentId}
      สถานะ: ${role}
      อาการ: ${selectedSymptomLabels}
      ${selectedSymptoms.includes(12) ? `หมายเหต: ${otherSymptom}` : ""}`
    ;
  
    const confirmed = window.confirm(confirmMessage);
  
    if (!confirmed) {
      return;
    }
  
    if (!studentId && role !== "บุคคลภายนอก" || !studentName || !role || selectedSymptoms.length === 0) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          "Please fill in all fields and select at least one symptom.",
        duration: 2000,
      });
      return;
    }
  
    const formData = {
      student_id: studentId,
      student_name: studentName,
      role: role,
      symptom_ids: selectedSymptoms,
      other_symptom: selectedSymptoms.includes(12) ? otherSymptom : "",
    };
  
    try {
      const response = await fetch("/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        toast({
          variant: "success",
          title: "Data Submitted",
          description: `ชื่อ-นามสกุล ${studentName} 
                          ตำแหน่ง ${role} 
                          อาการ ${selectedSymptomLabels} ${selectedSymptoms.includes(12) ? ` ${otherSymptom}` : ""
            }`,
          duration: 2000,
        });
        // รีเฟรชหน้าหลังการส่งข้อมูลสำเร็จ
        window.location.reload();
      } else {
        console.log("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-custom">
        <div className="bg-zinc-100 shadow-md p-8 max-w-lg w-full mb-20 form-border border-2 border-black">
          <div className="text-center text-2xl font-bold mb-6 text-gray-700">
            <h1>แบบฟอร์มนักศึกษาที่มาใช้ห้องพยาบาล</h1>
          </div>
          <form onSubmit={onSubmit} className="mx-8 mt-8 mb-2">
            <div className="mb-4">
              <label className="block text-gray-700 text-center font-bold text-lg">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                id="student_name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 block w-full p-2 border border-black input-border pl-4"
                placeholder="ชื่อ-นามสกุล"
                style={{ borderColor: "black" }}
              />
            </div>

            {role !== "บุคคลภายนอก" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-center font-bold text-lg">
                  รหัสประจำตัวผู้ป่วย
                </label>
                <input
                  type="text"
                  id="student_id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 block w-full p-2 border border-black input-border pl-4"
                  placeholder="รหัสประจำตัวผู้ป่วย"
                  style={{ borderColor: "black" }}
                />
              </div>
            )}

            <div className="my-5">
              <label className="block text-gray-700 text-center font-bold text-lg">
                เลือกบทบาท
              </label>
              <Select
                id="role"
                name="role"
                options={roleOptions}
                value={roleOptions.find(option => option.value === role)}
                onChange={handleRoleChange}
                placeholder="กรุณาเลือกบทบาท"
                className="text-gray-500 text-sm"
              />
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="block text-center font-bold text-lg">
                อาการ
              </label>
              <Select
                className="text-gray-500 text-sm"
                options={options}
                placeholder="เลือกอาการของคุณ"
                noOptionsMessage={() => "no results found"}
                onChange={handleSymptomChange}
                isMulti
              />
              {selectedSymptoms.includes(12) && (
                <div className="mt-4">
                  <label className="block text-gray-700 font-bold text-lg">
                    โปรดระบุอาการอื่นๆ
                  </label>
                  <input
                    type="text"
                    value={otherSymptom}
                    onChange={(e) => setOtherSymptom(e.target.value)}
                    className="mt-1 block w-full p-2 border border-black input-border pl-4"
                    placeholder="ระบุอาการอื่นๆ"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <Button className="bg-blue-700 hover:bg-blue-400" type="submit">
                ยืนยัน
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
