"use client";
import { MantineProvider } from "@mantine/core";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A linear line chart";

const chartConfig = {
  ticket_count: {
    label: "Ticket",
    color: "hsl(var(--chart-1))",
  },
};

function Report() {
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalYear, setTotalYear] = useState(0);
  const [symptomStats, setSymptomStats] = useState([]);
  const [pillStats, setPillStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]); // Added chartData state
  const today = new Date();
  const monthNamesThai = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const currentMonth = monthNamesThai[today.getMonth()];
  const currentYear = today.getFullYear() + 543;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched data:", data);

      const today = new Date();

      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const totalTodayTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfDay && ticketDate <= endOfDay;
        }).length || 0;

      const totalWeekTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfWeek && ticketDate <= endOfDay;
        }).length || 0;

      const totalMonthTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfMonth && ticketDate <= endOfDay;
        }).length || 0;

      const totalYearTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfYear && ticketDate <= endOfDay;
        }).length || 0;

      setTotalToday(totalTodayTickets);
      setTotalWeek(totalWeekTickets);
      setTotalMonth(totalMonthTickets);
      setTotalYear(totalYearTickets);
      setSymptomStats(data.symptomStats || []);
      setPillStats(data.pillStats || []);
      setChartData(data.chartData || []); // Set chartData fetched from the backend
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(chartData, "chart");
    fetchData();
  }, []);

  // Sort and limit the symptomStats to get the top 10 symptoms
  const topSymptoms = symptomStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sort and limit the pillStats to get the top 10 pills
  const topPills = pillStats.sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <MantineProvider>
      <div className="bg-gray-100">
        <div className="flex gap-4 justify-center py-4 bg-gray-100">
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายวัน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalToday
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายสัปดาห์
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalWeek
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายเดือน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalMonth
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายปี
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalYear
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full mx-4 gap-4 py-6 bg-gray-100 justify-center pr-10">
          <Card className= "h-80 w-1/3">
            <CardHeader>
              <CardTitle>Bar Chart - Label</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
            </CardFooter>
          </Card>
          <div className="bg-white flex flex-col items-center  display-border shadow-inner drop-shadow-md px-10 py-4">
            <h3 className="text-xl whitespace-nowrap text-center">
              อาการที่พบ
            </h3>
            <h3 className="text-xl whitespace-nowrap text-center">
              ในเดือน {currentMonth} {currentYear}
            </h3>
            <div className="text-lg mt-2">
              {console.log(symptomStats)}
              {symptomStats.length > 0 ? (
                symptomStats.map((stat) => (
                  <div key={stat.symptom_id}>
                    {stat.symptom_name}: {stat.count} คน
                  </div>
                ))
              ) : (
                <div>No data available</div>
              )}
            </div>
          </div>
          <div className="bg-white flex flex-col items-center  display-border shadow-inner drop-shadow-md px-10 py-4">
            <h3 className="text-xl whitespace-nowrap text-center">
              ยาที่จ่ายในเดือน
            </h3>
            <h3 className="text-xl whitespace-nowrap text-center">
              {currentMonth} {currentYear}
            </h3>
            <div className="text-lg mt-2">
              {topPills.length > 0 ? (
                (() => {
                  // Aggregate counts by pill name
                  const pillMap = topPills.reduce((acc, stat) => {
                    if (!acc[stat.pill_name]) {
                      acc[stat.pill_name] = 0;
                    }
                    acc[stat.pill_name] += stat.count;
                    return acc;
                  }, {});

                  return Object.entries(pillMap).map(
                    ([pill_name, count], index) => (
                      <div key={index}>
                        {pill_name} {count} ครั้ง
                      </div>
                    )
                  );
                })()
              ) : (
                <div>No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}

export default Report;
