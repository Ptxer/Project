import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Taskbar from "@/components/Taskbar";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MedicineComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pillStock, setPillStock] = useState([]);
  const [error, setError] = useState(null);

  const [pillName, setPillName] = useState("");
  const [dose, setDose] = useState("");
  const [typeName, setTypeName] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [total, setTotal] = useState("");
  const [unit, setUnit] = useState("");
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  
 
  
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/medicine", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPillStock(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, [session, status, router]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/medicine_type", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTypes(data);
      } catch (err) {
        console.error("Error fetching types:", err);
      }
    };

    const fetchUnits = async () => {
      try {
        const response = await fetch("/api/unit_type", { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUnits(data);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchTypes();
    fetchUnits();
  }, []);

  const handleSaveChanges = async () => {
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total,
      unit,
    };

    try {
      const response = await fetch("/api/save_medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPill),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data saved successfully:", data);
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleRemove = async (pillstock_id) => {
    try {
      const response = await fetch(`/api/medicine/${pillstock_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ total: 0 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPillStock(
        pillStock.filter((item) => item.pillstock_id !== pillstock_id)
      );
    } catch (err) {
      console.error("Error removing data:", err);
    }
  };

  const [selectedPill, setSelectedPill] = useState(null);

  const handleEditClick = (pill) => {
    setSelectedPill(pill);
    setPillName(pill.pill_name);
    setDose(pill.dose);
    setTypeName(pill.type_name);
    setExpireDate(
      pill.expire ? new Date(pill.expire).toISOString().split("T")[0] : ""
    );
    setTotal(pill.total);
    setUnit(pill.unit_type);
  };

  const handleEditPill = async () => {
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total: parseInt(total, 10),
      unit,
    };

    console.log("Sending data to server:", formPill);
    console.log("Request URL:", `/api/medicine/${selectedPill.pillstock_id}`);

    try {
      const response = await fetch(
        `/api/medicine/${selectedPill.pillstock_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formPill),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data updated successfully:", data);
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };

  if (status === "loading") {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  const filteredPillStock = pillStock.filter((item) => item.total > 0);
  const emptyRows = Math.max(0, 10 - filteredPillStock.length);



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <Taskbar />

      <main className="flex-1 p-5">
        <div className="mb-5 flex justify-end"></div>

        <div className="flex justify-center items-start">
          <div className="w-full overflow-x-auto">
            <table className="border-collapse border mx-auto w-full max-w-4xl">
              <thead>
                <tr className="border bg-gray-200">
                  <th className="border px-4 py-2">Lot Id</th>
                  <th className="border px-4 py-2">Pill Name</th>
                  <th className="border px-4 py-2">Dose</th>
                  <th className="border px-4 py-2">Type Name</th>
                  <th className="border px-4 py-2">Expire Date</th>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Unit Type</th>
                  <th className="border px-4 py-2 flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-800 text-white rounded">
                          Add Pill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Pill</DialogTitle>
                          <DialogDescription>
                            Enter the details of the new pill below and save
                            your changes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Pill Name
                            </Label>
                            <Input
                              id="name"
                              value={pillName}
                              onChange={(e) => setPillName(e.target.value)}
                              className="col-span-3"
                            />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dose" className="text-right">
                              Dose
                            </Label>
                            <Input
                              id="dose"
                              value={dose}
                              onChange={(e) => setDose(e.target.value)}
                              className="col-span-3"
                            />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="typeName" className="text-right">
                              Type Name
                            </Label>
                            <select
                              id="typeName"
                              value={typeName}
                              onChange={(e) => setTypeName(e.target.value)}
                              className="col-span-3 border rounded px-2 py-1"
                            >
                              <option value="">Select Type</option>
                              {types.map((type) => (
                                <option key={type.type_id} value={type.type_id}>
                                  {type.type_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">
                              Unit
                            </Label>
                            <select
                              id="unit"
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                              className="col-span-3 border rounded px-2 py-1"
                            >
                              <option value="">Select Unit</option>
                              {units.map((unitItem) => (
                                <option
                                  key={unitItem.unit_id}
                                  value={unitItem.unit_id}
                                >
                                  {unitItem.unit_type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total" className="text-right">
                              Total
                            </Label>
                            <Input
                              id="total"
                              type="number"
                              value={total}
                              onChange={(e) => setTotal(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4 mt-4">
                            <Label htmlFor="expire" className="text-right">
                              Expire Date
                            </Label>
                            <Input
                              type="date"
                              id="expire"
                              value={expireDate}
                              onChange={(e) => setExpireDate(e.target.value)}
                              className="col-span-3 border rounded px-2 py-1"
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button type="button" onClick={handleSaveChanges}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPillStock.length > 0 ? (
                  filteredPillStock.map((item) => (
                    <tr
                      key={item.pillstock_id}
                      className={`border ${Number(item.total) <= 100
                          ? "bg-red-500 text-red-500"
                          : "bg-blue-100 text-black"
                        }`}
                    >
                      <td className="border px-4 py-2">{item.pillstock_id}</td>
                      <td className="border px-4 py-2">{item.pill_name}</td>
                      <td className="border px-4 py-2">{item.dose}</td>
                      <td className="border px-4 py-2">{item.type_name}</td>
                      <td className="border px-4 py-2">
                        {item.expire
                          ? new Date(item.expire).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="border px-4 py-2">{item.total}</td>
                      <td className="border px-4 py-2">{item.unit_type}</td>
                      <td className="border px-4 py-2 flex justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-yellow-400 text-white rounded"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Pill</DialogTitle>
                              <DialogDescription>
                                Edit the details of the pill below and save your
                                changes.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Pill Name
                                </Label>
                                <Input
                                  id="name"
                                  value={pillName}
                                  onChange={(e) => setPillName(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dose" className="text-right">
                                  Dose
                                </Label>
                                <Input
                                  id="dose"
                                  value={dose}
                                  onChange={(e) => setDose(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="typeName"
                                  className="text-right"
                                >
                                  Type Name
                                </Label>
                                <select
                                  id="typeName"
                                  value={typeName}
                                  onChange={(e) => setTypeName(e.target.value)}
                                  className="col-span-3 border rounded px-2 py-1"
                                >
                                  <option value="">Select Type</option>
                                  {types.map((type) => (
                                    <option
                                      key={type.type_id}
                                      value={type.type_id}
                                    >
                                      {type.type_name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">
                                  Unit
                                </Label>
                                <select
                                  id="unit"
                                  value={unit}
                                  onChange={(e) => setUnit(e.target.value)}
                                  className="col-span-3 border rounded px-2 py-1"
                                >
                                  <option value="">Select Unit</option>
                                  {units.map((unitItem) => (
                                    <option
                                      key={unitItem.unit_id}
                                      value={unitItem.unit_id}
                                    >
                                      {unitItem.unit_type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="total" className="text-right">
                                  Total
                                </Label>
                                <Input
                                  id="total"
                                  type="number"
                                  value={total}
                                  onChange={(e) => setTotal(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                <Label htmlFor="expire" className="text-right">
                                  Expire Date
                                </Label>
                                <Input
                                  type="date"
                                  id="expire"
                                  value={expireDate}
                                  onChange={(e) =>
                                    setExpireDate(e.target.value)
                                  }
                                  className="col-span-3 border rounded px-2 py-1"
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                className="px-3 py-2 bg-red-600 text-white rounded"
                                onClick={() => handleRemove(item.pillstock_id)}
                              >
                                Remove
                              </Button>
                              <Button type="button" onClick={handleEditPill}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="flex justify-center items-center h-full">
                        currently no pill in stock
                      </div>
                    </td>
                  </tr>
                )}
                {Array.from({ length: emptyRows }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan="8" className="border px-4 py-2">
                      &nbsp;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <div> space </div>


        <div className="flex justify-center items-start">
          <div className="w-full overflow-x-auto">
            <table className="border-collapse border mx-auto w-full max-w-4xl">
              <thead>
                <tr className="border bg-gray-200">
                  <th className="border px-4 py-2">Pill id</th>
                  <th className="border px-4 py-2">Pill Name</th>
                  <th className="border px-4 py-2">Dose</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2 flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-800 text-white rounded">
                          Add Pill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Pill</DialogTitle>
                          <DialogDescription>
                            Enter the details of the new pill below and save
                            your changes.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Pill Name
                            </Label>
                            <Input
                              id="name"
                              value={pillName}
                              onChange={(e) => setPillName(e.target.value)}
                              className="col-span-3"
                            />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dose" className="text-right">
                              Dose
                            </Label>
                            <Input
                              id="dose"
                              value={dose}
                              onChange={(e) => setDose(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button type="button" onClick={handleSaveChanges}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPillStock.length > 0 ? (
                  filteredPillStock.map((item) => (
                    <tr key={item.pill_id} className="border bg-blue-100 text-black">
                      <td className="border px-4 py-2">{item.pill_id}</td>
                      <td className="border px-4 py-2">{item.pill_name}</td>
                      <td className="border px-4 py-2">{item.dose}</td>
                      <td className="border px-4 py-2">{item.type_name}</td>
                      <td className="border px-4 py-2 flex justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-yellow-400 text-white rounded"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Pill</DialogTitle>
                              <DialogDescription>
                                Edit the details of the pill below and save your
                                changes.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Pill Name
                                </Label>
                                <Input
                                  id="name"
                                  value={pillName}
                                  onChange={(e) => setPillName(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dose" className="text-right">
                                  Dose
                                </Label>
                                <Input
                                  id="dose"
                                  value={dose}
                                  onChange={(e) => setDose(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                className="px-3 py-2 bg-red-600 text-white rounded"
                                onClick={() => handleRemove(item.pill_id)}
                              >
                                Remove
                              </Button>
                              <Button type="button" onClick={handleEditPill}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="flex justify-center items-center h-full">
                        currently no pill in stock
                      </div>
                    </td>
                  </tr>
                )}
                {Array.from({ length: emptyRows }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan="8" className="border px-4 py-2">
                      &nbsp;
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>




      </main>
    </div>
  );
}
